#!/usr/bin/env python3
"""
enumerate_files.py — Enumerate and classify every relevant source file in a project.

Usage:
    python enumerate_files.py [ROOT_DIR]

Output: JSON to stdout with keys:
    - root: absolute path of the scanned root
    - total: count of included files
    - by_type: { type_name: [file_paths...] }
    - by_module: { module_name: [file_paths...] }
    - files: [ { path, type, module, size_bytes } ]
    - skipped: [ { path, reason } ]
    - warnings: [ warning_strings ]

Exit codes:
    0: success
    2: ROOT_DIR does not exist

Zero third-party dependencies.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Optional

# ---- Exclusion rules ---- #

EXCLUDE_DIRS = {
    "node_modules", ".git", ".svn", ".hg", "dist", "build", "target", "out",
    ".next", ".nuxt", ".angular", ".svelte-kit", "coverage", ".nyc_output",
    "__pycache__", ".pytest_cache", ".tox", ".venv", "venv", "env",
    ".idea", ".vscode", ".gradle", ".mvn", "vendor", "bower_components",
    ".cache", ".parcel-cache", "tmp", "temp", ".turbo",
}

EXCLUDE_SUFFIXES = {
    ".min.js", ".min.css", ".map", ".lock", ".log", ".tmp",
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
    ".woff", ".woff2", ".ttf", ".eot", ".otf",
    ".zip", ".tar", ".gz", ".rar", ".7z",
    ".pdf", ".docx", ".xlsx", ".pptx",
    ".mp3", ".mp4", ".mov", ".avi", ".wav",
}

EXCLUDE_NAMES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "composer.lock",
    "Cargo.lock", "Gemfile.lock", "Pipfile.lock", "poetry.lock", "uv.lock",
    "LICENSE", "LICENCE", "COPYING", "NOTICE", "CHANGELOG.md", "HISTORY.md",
    ".DS_Store", "Thumbs.db",
}

TEST_SUFFIX_PATTERNS = [
    re.compile(r".*\.spec\.(ts|tsx|js|jsx)$"),
    re.compile(r".*\.test\.(ts|tsx|js|jsx)$"),
    re.compile(r"^test_.*\.py$"),
    re.compile(r".*_test\.py$"),
    re.compile(r".*Test\.java$"),
    re.compile(r".*Tests\.java$"),
    re.compile(r".*IT\.java$"),
    re.compile(r".*_test\.go$"),
]

GENERATED_DECLARATIONS = re.compile(r".*\.d\.ts$")

# File size cap: 500 KB
MAX_FILE_SIZE = 500 * 1024

# Volume thresholds
VOLUME_WARN = 200
VOLUME_HARD_STOP = 500


# ---- Classification ---- #

CONFIG_BASENAMES = {
    "package.json", "tsconfig.json", "tsconfig.app.json", "tsconfig.base.json",
    "tsconfig.spec.json", "tsconfig.lib.json", "angular.json", "nx.json",
    "project.json", "workspace.json", "pom.xml", "build.gradle",
    "build.gradle.kts", "settings.gradle", "settings.gradle.kts",
    "pyproject.toml", "requirements.txt", "setup.py", "setup.cfg", "Pipfile",
    "go.mod", "go.sum", "Cargo.toml", "package-lock.json",
    "vite.config.ts", "vite.config.js", "webpack.config.js", "rollup.config.js",
    "next.config.js", "next.config.ts", "next.config.mjs",
    "nuxt.config.ts", "svelte.config.js", "astro.config.mjs",
    ".eslintrc", ".eslintrc.json", ".eslintrc.js", "eslint.config.js",
    ".prettierrc", ".prettierrc.json", "prettier.config.js",
    ".babelrc", "babel.config.js", "jest.config.js", "jest.config.ts",
    "vitest.config.ts", "karma.conf.js", "playwright.config.ts",
}
# package-lock.json is in EXCLUDE_NAMES; leaving it here is harmless,
# exclusion runs first.

DOCKER_BASENAMES = {"Dockerfile", "dockerfile", ".dockerignore"}
DOCKER_COMPOSE_RE = re.compile(r"^(docker-)?compose.*\.ya?ml$")

ENV_BASENAMES = {
    "application.properties", "application.yml", "application.yaml",
}
ENV_FILE_RE = re.compile(r"^(\.env.*|application-[a-zA-Z0-9_-]+\.(properties|yml|yaml))$")

CI_WORKFLOW_DIR_PARTS = (".github", "workflows")
CI_FILES = {"Jenkinsfile", ".gitlab-ci.yml", "bitbucket-pipelines.yml", "azure-pipelines.yml"}


# Decorators we detect by file content
DECORATOR_RE = {
    "component": re.compile(r"@Component\s*\("),
    "injectable": re.compile(r"@Injectable\s*\("),
    "directive": re.compile(r"@Directive\s*\("),
    "pipe": re.compile(r"@Pipe\s*\("),
    "ngmodule": re.compile(r"@NgModule\s*\("),
    "java_controller": re.compile(r"@(Rest)?Controller\b"),
    "java_service": re.compile(r"@Service\b"),
    "java_repository": re.compile(r"@Repository\b|extends\s+(Crud|Jpa|PagingAndSorting)Repository"),
    "java_entity": re.compile(r"@Entity\b"),
    "java_config": re.compile(r"@Configuration\b"),
    "http_interceptor": re.compile(r"implements\s+HttpInterceptor|HttpInterceptorFn"),
    "can_activate": re.compile(r"implements\s+CanActivate|CanActivateFn|CanMatchFn"),
    "resolve": re.compile(r"implements\s+Resolve\b|ResolveFn"),
}


def _should_skip_dir(name: str) -> bool:
    return name in EXCLUDE_DIRS or name.startswith(".")


def _is_test_file(name: str) -> bool:
    return any(p.match(name) for p in TEST_SUFFIX_PATTERNS)


def _is_generated_dts(name: str) -> bool:
    return bool(GENERATED_DECLARATIONS.match(name))


def _is_binary(path: Path) -> bool:
    try:
        with open(path, "rb") as f:
            chunk = f.read(1024)
        return b"\x00" in chunk
    except OSError:
        return True


def _peek(path: Path, max_chars: int = 4000) -> str:
    try:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read(max_chars)
    except OSError:
        return ""


def _infer_module(path: Path, root: Path) -> str:
    rel = path.relative_to(root)
    parts = rel.parts[:-1]  # drop filename

    # Angular-ish conventions
    for i, p in enumerate(parts):
        if p == "features" and i + 1 < len(parts):
            return f"features/{parts[i + 1]}"
        if p == "core":
            return "core"
        if p == "shared":
            return "shared"
        if p == "pages" and i + 1 < len(parts):
            return f"pages/{parts[i + 1]}"
        if p == "app" and i + 1 < len(parts):
            # catches src/app/<something>
            candidate = parts[i + 1]
            if candidate not in ("features", "core", "shared", "pages"):
                return f"app/{candidate}"

    # Java-ish conventions: src/main/java/<pkg>/<pkg>/<pkg>/<module>
    if "java" in parts:
        idx = parts.index("java")
        remainder = parts[idx + 1:]
        if len(remainder) >= 3:
            return remainder[2]  # skip group + artifact
        if remainder:
            return remainder[-1]

    # Python / Node — first level under src
    if parts and parts[0] == "src" and len(parts) >= 2:
        return parts[1]

    if not parts:
        return "root"
    return parts[0]


def _classify(path: Path, root: Path) -> Optional[str]:
    name = path.name

    # Config files by exact name
    if name in CONFIG_BASENAMES:
        return "config-file"
    if name in DOCKER_BASENAMES or DOCKER_COMPOSE_RE.match(name):
        return "docker-file"
    if name in ENV_BASENAMES or ENV_FILE_RE.match(name):
        return "env-file"
    if name in CI_FILES:
        return "ci-file"

    # CI workflow YAMLs live under .github/workflows/
    rel_parts = path.relative_to(root).parts
    if len(rel_parts) >= 3 and rel_parts[0] == ".github" and rel_parts[1] == "workflows":
        if name.endswith((".yml", ".yaml")):
            return "ci-file"

    suffix = path.suffix.lower()

    # SQL migrations
    if suffix == ".sql" and any("migration" in p.lower() for p in rel_parts):
        return "sql-migration"

    # TypeScript / JavaScript
    if suffix in (".ts", ".tsx", ".js", ".jsx"):
        content = _peek(path)
        # Decorators first
        if DECORATOR_RE["component"].search(content):
            return "angular-component"
        if DECORATOR_RE["injectable"].search(content):
            return "angular-service"
        if DECORATOR_RE["directive"].search(content):
            return "angular-directive"
        if DECORATOR_RE["pipe"].search(content):
            return "angular-pipe"
        if DECORATOR_RE["ngmodule"].search(content):
            return "angular-module"
        if DECORATOR_RE["http_interceptor"].search(content):
            return "angular-interceptor"
        if DECORATOR_RE["can_activate"].search(content):
            return "angular-guard"
        if DECORATOR_RE["resolve"].search(content):
            return "angular-resolver"
        # Naming fallback
        lname = name.lower()
        if lname.endswith((".component.ts", ".component.tsx")):
            return "angular-component"
        if lname.endswith((".service.ts", ".service.tsx")):
            return "angular-service"
        if lname.endswith(".guard.ts"):
            return "angular-guard"
        if lname.endswith(".pipe.ts"):
            return "angular-pipe"
        if lname.endswith(".directive.ts"):
            return "angular-directive"
        if lname.endswith(".module.ts"):
            return "angular-module"
        if lname.endswith(".resolver.ts"):
            return "angular-resolver"
        if lname.endswith(".interceptor.ts"):
            return "angular-interceptor"
        if lname.endswith((".model.ts", ".dto.ts", ".interface.ts", ".types.ts")):
            return "typescript-model"
        if lname.endswith((".utils.ts", ".helpers.ts", ".util.ts")):
            return "typescript-util"
        # Node/Express route detection: look for `app.get(` etc.
        if re.search(r"\b(app|router|server|fastify)\.(get|post|put|delete|patch|all|use)\s*\(", content):
            return "node-route"
        if re.search(r"function\s+\w+\s*\(\s*req\s*,\s*res\s*,\s*next\s*\)", content) or \
           re.search(r"\(\s*req\s*,\s*res\s*,\s*next\s*\)\s*=>", content):
            return "node-middleware"
        return "typescript-source" if suffix in (".ts", ".tsx") else "javascript-source"

    # HTML paired with a TS sibling
    if suffix == ".html":
        ts_sibling = path.with_suffix(".ts")
        ts_component = path.with_name(path.stem + ".component.ts")
        if ts_sibling.exists() or ts_component.exists():
            return "angular-template"
        return None  # other HTML not interesting

    # CSS/SCSS paired with a TS sibling
    if suffix in (".scss", ".css", ".sass"):
        ts_sibling = path.with_suffix(".ts")
        ts_component = path.with_name(path.stem + ".component.ts")
        if ts_sibling.exists() or ts_component.exists():
            return "angular-style"
        return None

    # Java / Kotlin
    if suffix == ".java":
        content = _peek(path)
        if DECORATOR_RE["java_controller"].search(content):
            return "java-controller"
        if DECORATOR_RE["java_service"].search(content):
            return "java-service"
        if DECORATOR_RE["java_repository"].search(content):
            return "java-repository"
        if DECORATOR_RE["java_entity"].search(content):
            return "java-entity"
        if DECORATOR_RE["java_config"].search(content):
            return "java-config"
        # DTO heuristic: class with only fields + getters/setters (no annotations)
        lname = name.lower()
        if "dto" in lname or "request" in lname or "response" in lname:
            return "java-dto"
        return "java-source"

    if suffix == ".kt":
        return "kotlin-source"

    # Python
    if suffix == ".py":
        content = _peek(path)
        if re.search(r"@(app|router)\.(get|post|put|delete|patch)\b", content) or \
           re.search(r"class\s+\w+View(Set)?\s*\(", content):
            return "python-view"
        if re.search(r"class\s+\w+\s*\(\s*(models\.Model|Base|db\.Model)\s*\)", content):
            return "python-model"
        return "python-source"

    # Go / Rust / C#
    if suffix == ".go":
        return "go-source"
    if suffix == ".rs":
        return "rust-source"
    if suffix == ".cs":
        return "csharp-source"

    # SQL fallback
    if suffix == ".sql":
        return "sql-file"

    return None


def enumerate_repo(root: Path, include_tests: bool = False,
                   include_markdown: bool = False) -> dict:
    included: list[dict] = []
    skipped: list[dict] = []

    def skip(p: Path, reason: str) -> None:
        try:
            rel = str(p.relative_to(root))
        except ValueError:
            rel = str(p)
        skipped.append({"path": rel, "reason": reason})

    for path in sorted(root.rglob("*")):
        try:
            if any(_should_skip_dir(part) for part in path.relative_to(root).parts[:-1]):
                continue
        except ValueError:
            continue

        if not path.is_file():
            continue

        name = path.name

        if name in EXCLUDE_NAMES:
            skip(path, "excluded by name")
            continue

        if any(name.endswith(suf) for suf in EXCLUDE_SUFFIXES):
            skip(path, "excluded by suffix")
            continue

        if _is_test_file(name) and not include_tests:
            skip(path, "test file (use --include-tests to include)")
            continue

        if _is_generated_dts(name):
            skip(path, "generated .d.ts")
            continue

        if name.endswith(".md") and not include_markdown:
            skip(path, "markdown (use --include-markdown to include)")
            continue

        try:
            size = path.stat().st_size
        except OSError:
            skip(path, "stat failed")
            continue

        if size > MAX_FILE_SIZE:
            skip(path, f"file too large ({size // 1024} KB > {MAX_FILE_SIZE // 1024} KB)")
            continue

        if size == 0:
            skip(path, "empty file")
            continue

        if _is_binary(path):
            skip(path, "binary file")
            continue

        file_type = _classify(path, root)
        if file_type is None:
            skip(path, "not in include list")
            continue

        rel = str(path.relative_to(root))
        included.append({
            "path": rel,
            "type": file_type,
            "module": _infer_module(path, root),
            "size_bytes": size,
        })

    # Group
    by_type: dict[str, list[str]] = {}
    by_module: dict[str, list[str]] = {}
    for f in included:
        by_type.setdefault(f["type"], []).append(f["path"])
        by_module.setdefault(f["module"], []).append(f["path"])

    warnings: list[str] = []
    total = len(included)
    if total > VOLUME_HARD_STOP:
        warnings.append(
            f"HARD-STOP: {total} files exceeds {VOLUME_HARD_STOP}. "
            f"Narrow the scope or approve a split-by-module output."
        )
    elif total > VOLUME_WARN:
        warnings.append(
            f"WARN: {total} files exceeds {VOLUME_WARN}. "
            f"Consider splitting by module."
        )

    return {
        "root": str(root),
        "total": total,
        "by_type": {k: sorted(v) for k, v in sorted(by_type.items())},
        "by_module": {k: sorted(v) for k, v in sorted(by_module.items())},
        "files": included,
        "skipped": skipped[:300],
        "warnings": warnings,
    }


def main() -> int:
    args = sys.argv[1:]
    include_tests = "--include-tests" in args
    include_markdown = "--include-markdown" in args
    positional = [a for a in args if not a.startswith("--")]
    root = Path(positional[0] if positional else ".").resolve()
    if not root.exists():
        print(json.dumps({"error": f"root does not exist: {root}"}), file=sys.stderr)
        return 2
    result = enumerate_repo(root, include_tests=include_tests,
                            include_markdown=include_markdown)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
