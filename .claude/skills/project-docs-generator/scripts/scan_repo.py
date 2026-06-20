#!/usr/bin/env python3
"""
scan_repo.py — Fast repo scanner that extracts: folder tree (2 levels),
entrypoints, env files, HTTP routes, and external integration URLs.

Usage:
    python scan_repo.py [ROOT_DIR]

Outputs JSON to stdout. Always exits 0 unless ROOT_DIR does not exist.

Zero third-party dependencies.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

IGNORE_DIRS = {
    "node_modules", ".git", "dist", "build", "target", ".next",
    "coverage", "__pycache__", ".venv", "venv", ".mvn", ".gradle",
    ".idea", ".vscode", ".angular", "out", ".nuxt", ".svelte-kit",
}

CODE_EXTS = {".ts", ".tsx", ".js", ".jsx", ".java", ".kt", ".py", ".go", ".rs", ".cs"}
CONFIG_EXTS = {".yml", ".yaml", ".properties", ".toml", ".json"}

MAX_ROUTES = 250
MAX_URLS = 80


def _skip(path: Path) -> bool:
    return any(part in IGNORE_DIRS for part in path.parts)


def tree_2_levels(root: Path, max_entries: int = 80) -> list[dict]:
    entries: list[dict] = []
    try:
        level1_items = sorted(root.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower()))
    except (PermissionError, OSError):
        return []
    for level1 in level1_items:
        if level1.name in IGNORE_DIRS or level1.name.startswith("."):
            continue
        if level1.is_dir():
            children: list[str] = []
            try:
                for level2 in sorted(level1.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())):
                    if level2.name in IGNORE_DIRS or level2.name.startswith("."):
                        continue
                    label = level2.name + ("/" if level2.is_dir() else "")
                    children.append(label)
                    if len(children) >= 25:
                        children.append("…")
                        break
            except (PermissionError, OSError):
                pass
            entries.append({"name": level1.name + "/", "children": children})
        else:
            entries.append({"name": level1.name})
        if len(entries) >= max_entries:
            break
    return entries


ENTRYPOINT_NAMES = {
    "main.ts", "main.java", "Main.java", "index.ts", "index.js",
    "server.ts", "server.js", "app.ts", "app.js", "Application.java",
    "main.py", "app.py", "manage.py", "main.go", "main.rs",
    "bootstrap.ts", "bootstrap.js",
}


def find_entrypoints(root: Path) -> list[str]:
    found: set[str] = set()
    for p in root.rglob("*"):
        if not p.is_file() or _skip(p):
            continue
        if p.name in ENTRYPOINT_NAMES:
            try:
                found.add(str(p.relative_to(root)))
            except ValueError:
                pass
        if len(found) > 50:
            break
    return sorted(found)[:20]


ENV_FILES = {
    ".env", ".env.example", ".env.sample", ".env.local", ".env.template",
    "application.properties", "application.yml", "application.yaml",
    "environment.ts", "environment.prod.ts", "environment.dev.ts",
    "config.yml", "config.yaml", "settings.py",
}


def find_env_files(root: Path) -> list[str]:
    found: set[str] = set()
    for p in root.rglob("*"):
        if not p.is_file() or _skip(p):
            continue
        if p.name in ENV_FILES:
            try:
                found.add(str(p.relative_to(root)))
            except ValueError:
                pass
        if len(found) > 80:
            break
    return sorted(found)


# Route extraction patterns
ROUTE_PATTERNS: list[tuple[str, str]] = [
    # Express / Koa / Hapi (Node)
    (r'\b(?:app|router|server|fastify)\.(get|post|put|delete|patch|all|options|head)\s*\(\s*[\'"`]([^\'"`]+)[\'"`]', "node"),
    # NestJS decorators
    (r'@(Get|Post|Put|Delete|Patch|Options|Head|All)\s*\(\s*[\'"]([^\'"]*)[\'"]?\s*\)', "nest"),
    # Spring
    (r'@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping|RequestMapping)\s*\(\s*(?:value\s*=\s*)?[\'"]([^\'"]*)[\'"]', "spring"),
    # FastAPI / Flask
    (r'@(?:app|router|api|blueprint)\.(get|post|put|delete|patch)\s*\(\s*[\'"]([^\'"]+)[\'"]', "python"),
    # Angular route definitions (path property)
    (r'\{\s*path\s*:\s*[\'"]([^\'"]*)[\'"]', "angular-route"),
]


def find_routes(root: Path) -> list[dict]:
    routes: list[dict] = []
    for p in root.rglob("*"):
        if not p.is_file() or _skip(p):
            continue
        if p.suffix not in CODE_EXTS:
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except (OSError, UnicodeDecodeError):
            continue
        rel = str(p.relative_to(root))
        for pattern, flavor in ROUTE_PATTERNS:
            for m in re.finditer(pattern, text):
                if flavor == "angular-route":
                    routes.append({
                        "method": "ROUTE",
                        "path": m.group(1),
                        "flavor": flavor,
                        "file": rel,
                    })
                else:
                    routes.append({
                        "method": m.group(1).upper(),
                        "path": m.group(2),
                        "flavor": flavor,
                        "file": rel,
                    })
                if len(routes) >= MAX_ROUTES:
                    return routes
    return routes


URL_RE = re.compile(r'https?://[a-zA-Z0-9.\-]+(?:/[^\s\'"`<>)]*)?')
HTTP_MARKER_RE = re.compile(r'\b(HttpClient|RestTemplate|WebClient|fetch\s*\(|axios\.|requests\.)\b')


def find_integrations(root: Path) -> dict:
    urls: set[str] = set()
    markers: set[str] = set()
    search_exts = CODE_EXTS | CONFIG_EXTS
    for p in root.rglob("*"):
        if not p.is_file() or _skip(p):
            continue
        if p.suffix not in search_exts:
            continue
        try:
            text = p.read_text(encoding="utf-8", errors="ignore")
        except (OSError, UnicodeDecodeError):
            continue

        for m in URL_RE.finditer(text):
            url = m.group(0)
            if any(x in url for x in ("localhost", "127.0.0.1", "0.0.0.0",
                                       "example.com", "example.org",
                                       "w3.org", "schemas.xmlsoap.org",
                                       "maven.apache.org", "w3.org",
                                       "jakarta.ee", "java.sun.com")):
                continue
            urls.add(url[:150])
            if len(urls) >= MAX_URLS:
                break
        for m in HTTP_MARKER_RE.finditer(text):
            markers.add(m.group(1).replace("(", "").strip())
        if len(urls) >= MAX_URLS:
            break
    return {
        "external_urls": sorted(urls)[:MAX_URLS],
        "http_markers": sorted(markers),
    }


def read_package_json_scripts(root: Path) -> dict:
    pkg = root / "package.json"
    if not pkg.exists():
        return {}
    try:
        data = json.loads(pkg.read_text(encoding="utf-8"))
        return data.get("scripts", {}) or {}
    except (OSError, json.JSONDecodeError):
        return {}


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    if not root.exists():
        print(json.dumps({"error": f"root does not exist: {root}"}), file=sys.stderr)
        return 2

    result = {
        "root": str(root),
        "tree": tree_2_levels(root),
        "entrypoints": find_entrypoints(root),
        "env_files": find_env_files(root),
        "routes": find_routes(root),
        "integrations": find_integrations(root),
        "package_scripts": read_package_json_scripts(root),
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
