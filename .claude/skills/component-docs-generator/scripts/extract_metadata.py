#!/usr/bin/env python3
"""
extract_metadata.py — Extract structured metadata from a single source file.

Usage:
    python extract_metadata.py PATH_TO_FILE [--type TYPE]

Output: JSON to stdout with keys depending on file type. Always includes:
    - path
    - type (detected or overridden)
    - success (bool)
    - metadata (dict, type-specific)

When the extractor cannot handle a type, it returns success=false and
includes the first 20 lines of the file under metadata.first_lines so the
caller can still render something useful.

Zero third-party dependencies. Regex-based parsing — not a full AST parser.
For complex cases the caller should read the file directly.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path


# ----------------------------- helpers ----------------------------- #

def _read(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""


def _first_lines(text: str, n: int = 20) -> list[str]:
    return text.splitlines()[:n]


def _collect_imports_ts(text: str) -> list[str]:
    # import X from '...'; import { A, B } from '...'; import * as X from '...'
    imports: list[str] = []
    pat = re.compile(
        r"""import\s+(?:[^'";]*?)from\s*['"]([^'"]+)['"]""", re.MULTILINE
    )
    for m in pat.finditer(text):
        imports.append(m.group(1))
    # Deduplicate, preserve order
    seen: set[str] = set()
    out: list[str] = []
    for i in imports:
        if i not in seen:
            seen.add(i)
            out.append(i)
    return out


def _collect_imports_java(text: str) -> list[str]:
    imports: list[str] = []
    for m in re.finditer(r"^\s*import\s+(?:static\s+)?([\w.*]+)\s*;", text, re.MULTILINE):
        imp = m.group(1)
        if imp.startswith(("java.lang.", "java.util.")):
            continue
        imports.append(imp)
    return imports


def _extract_decorator_object(text: str, decorator: str) -> str:
    """Return the raw object literal inside @Decorator({...}), balanced braces."""
    match = re.search(rf"@{decorator}\s*\(", text)
    if not match:
        return ""
    i = match.end()
    # Skip whitespace
    while i < len(text) and text[i].isspace():
        i += 1
    if i >= len(text) or text[i] != "{":
        return ""
    depth = 0
    start = i
    in_string: str | None = None
    escape = False
    while i < len(text):
        c = text[i]
        if escape:
            escape = False
        elif c == "\\":
            escape = True
        elif in_string:
            if c == in_string:
                in_string = None
        elif c in ("'", '"', "`"):
            in_string = c
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return text[start: i + 1]
        i += 1
    return ""


def _parse_object_field(obj: str, field: str) -> str:
    """Extract a primitive field value from a JS object literal as a string."""
    # matches: field: 'value' | field: "value" | field: identifier | field: true/false
    pat = re.compile(
        rf"""\b{re.escape(field)}\s*:\s*(?:['"`]([^'"`]*)['"`]|([\w.]+))"""
    )
    m = pat.search(obj)
    if not m:
        return ""
    return m.group(1) if m.group(1) is not None else m.group(2)


def _parse_object_array_field(obj: str, field: str, max_items: int = 8) -> list[str]:
    """Extract an array field from a JS object literal as list of identifiers/strings."""
    # matches: field: [ ... ]
    m = re.search(rf"\b{re.escape(field)}\s*:\s*\[", obj)
    if not m:
        return []
    depth = 0
    i = m.end() - 1  # position of the opening '['
    start = i + 1
    while i < len(obj):
        c = obj[i]
        if c == "[":
            depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                inner = obj[start:i]
                break
        i += 1
    else:
        return []
    # Split by top-level commas
    items: list[str] = []
    buf = ""
    ndepth = 0
    in_string: str | None = None
    escape = False
    for c in inner:
        if escape:
            buf += c
            escape = False
            continue
        if c == "\\":
            buf += c
            escape = True
            continue
        if in_string:
            buf += c
            if c == in_string:
                in_string = None
            continue
        if c in ("'", '"', "`"):
            in_string = c
            buf += c
            continue
        if c in "[{(":
            ndepth += 1
            buf += c
            continue
        if c in "]})":
            ndepth -= 1
            buf += c
            continue
        if c == "," and ndepth == 0:
            item = buf.strip().strip("'\"`")
            if item:
                items.append(item)
            buf = ""
            continue
        buf += c
    if buf.strip():
        items.append(buf.strip().strip("'\"`"))
    if len(items) > max_items:
        items = items[:max_items] + [f"... (+{len(items) - max_items} más)"]
    return items


# --------------------- Angular component / service --------------------- #

def extract_angular_component(path: Path, text: str) -> dict:
    obj = _extract_decorator_object(text, "Component")
    meta: dict = {
        "decorator": {
            "selector": _parse_object_field(obj, "selector"),
            "standalone": _parse_object_field(obj, "standalone") or "true",
            "changeDetection": _parse_object_field(obj, "changeDetection"),
            "templateUrl": _parse_object_field(obj, "templateUrl"),
            "styleUrls": _parse_object_array_field(obj, "styleUrls", max_items=4),
            "imports": _parse_object_array_field(obj, "imports", max_items=8),
        },
        "class": _extract_class_declaration(text),
        "inputs": _extract_angular_inputs(text),
        "outputs": _extract_angular_outputs(text),
        "lifecycle": _extract_lifecycle_hooks(text),
        "injected": _extract_injected_services(text),
        "public_methods": _extract_ts_public_methods(text),
        "imports": _collect_imports_ts(text),
    }
    return meta


def extract_angular_service(path: Path, text: str) -> dict:
    obj = _extract_decorator_object(text, "Injectable")
    meta = {
        "decorator": {
            "providedIn": _parse_object_field(obj, "providedIn"),
        },
        "class": _extract_class_declaration(text),
        "injected": _extract_injected_services(text),
        "public_methods": _extract_ts_public_methods(text),
        "public_fields": _extract_ts_public_fields(text),
        "imports": _collect_imports_ts(text),
    }
    return meta


def _extract_class_declaration(text: str) -> str:
    m = re.search(
        r"export\s+(?:abstract\s+)?class\s+\w+(?:\s+extends\s+\w+(?:<[^>]*>)?)?(?:\s+implements\s+[\w,\s]+)?",
        text,
    )
    return m.group(0).strip() if m else ""


def _extract_angular_inputs(text: str) -> list[str]:
    inputs: list[str] = []
    # Modern signal inputs: readonly foo = input<Type>(...) | input.required<Type>(...)
    for m in re.finditer(
        r"(?:readonly\s+)?(\w+)\s*=\s*input(?:\.required)?(?:<([^>]+)>)?\s*\(",
        text,
    ):
        name = m.group(1)
        type_ = m.group(2) or ""
        required = ".required" in m.group(0)
        inputs.append(f"{name}{'!' if required else ''}: {type_}".strip())
    # Legacy decorator: @Input() foo: Type  |  @Input() foo!: Type
    for m in re.finditer(r"@Input\(\s*(?:'([^']*)')?\s*\)\s+(\w+)\s*([!?]?):\s*([^;=\n]+)", text):
        alias = m.group(1)
        name = m.group(2)
        type_ = m.group(4).strip()
        label = f"{alias or name}: {type_}"
        inputs.append(label)
    return inputs


def _extract_angular_outputs(text: str) -> list[str]:
    outputs: list[str] = []
    # Modern: readonly foo = output<Type>()
    for m in re.finditer(r"(?:readonly\s+)?(\w+)\s*=\s*output(?:<([^>]+)>)?\s*\(", text):
        name = m.group(1)
        type_ = m.group(2) or "void"
        outputs.append(f"{name}: EventEmitter<{type_}>")
    # Legacy: @Output() foo = new EventEmitter<Type>()
    for m in re.finditer(
        r"@Output\(\s*(?:'([^']*)')?\s*\)\s+(\w+)\s*=\s*new\s+EventEmitter<([^>]*)>",
        text,
    ):
        alias = m.group(1)
        name = m.group(2)
        type_ = m.group(3)
        outputs.append(f"{alias or name}: EventEmitter<{type_}>")
    return outputs


LIFECYCLE_HOOKS = [
    "ngOnInit", "ngOnChanges", "ngOnDestroy",
    "ngAfterViewInit", "ngAfterContentInit",
    "ngDoCheck", "ngAfterViewChecked", "ngAfterContentChecked",
]


def _extract_lifecycle_hooks(text: str) -> list[str]:
    found = []
    for hook in LIFECYCLE_HOOKS:
        if re.search(rf"\b{hook}\s*\(", text):
            found.append(hook)
    return found


def _extract_injected_services(text: str) -> list[str]:
    services: list[str] = []
    # Modern: private readonly x = inject(XService)
    for m in re.finditer(
        r"(?:private\s+|protected\s+)?(?:readonly\s+)?(\w+)\s*=\s*inject\s*\(\s*(\w+)",
        text,
    ):
        name = m.group(1)
        svc = m.group(2)
        services.append(f"{name}: {svc}")
    # Legacy: constructor(private x: XService, public y: YService)
    ctor_match = re.search(r"constructor\s*\(([^)]*)\)", text, re.DOTALL)
    if ctor_match:
        params = ctor_match.group(1)
        for m in re.finditer(
            r"(?:private|public|protected|readonly)\s+(?:readonly\s+)?(\w+)\s*:\s*([\w<>,\s]+?)(?=,|$)",
            params,
        ):
            name = m.group(1)
            type_ = m.group(2).strip()
            services.append(f"{name}: {type_}")
    return services


def _extract_ts_public_methods(text: str) -> list[str]:
    methods: list[str] = []
    # Very naive — matches non-private, non-constructor method declarations at class scope.
    pattern = re.compile(
        r"^\s+(?!private|protected|static\s+private)(?!constructor\b)"
        r"(?:public\s+|async\s+|override\s+|readonly\s+)*"
        r"(\w+)\s*\(([^)]*)\)(?:\s*:\s*([^{;=]+))?\s*\{",
        re.MULTILINE,
    )
    for m in pattern.finditer(text):
        name = m.group(1)
        if name in LIFECYCLE_HOOKS or name in ("get", "set"):
            continue
        if name.startswith("_"):
            continue
        params = re.sub(r"\s+", " ", m.group(2)).strip()
        ret = (m.group(3) or "").strip()
        sig = f"{name}({params})"
        if ret:
            sig += f": {ret}"
        methods.append(sig)
        if len(methods) >= 30:
            break
    return methods


def _extract_ts_public_fields(text: str) -> list[str]:
    fields: list[str] = []
    pattern = re.compile(
        r"^\s+(?:public\s+|readonly\s+)*(\w+)\s*=\s*"
        r"(signal|computed|input|output|model|viewChild|contentChild|viewChildren|contentChildren)\b",
        re.MULTILINE,
    )
    for m in pattern.finditer(text):
        name = m.group(1)
        kind = m.group(2)
        fields.append(f"{name} ({kind})")
        if len(fields) >= 20:
            break
    return fields


# ------------------------- Java extractors ------------------------- #

def extract_java_class(path: Path, text: str) -> dict:
    meta: dict = {
        "package": _extract_java_package(text),
        "class": _extract_java_class_declaration(text),
        "annotations": _extract_java_class_annotations(text),
        "fields": _extract_java_fields(text),
        "methods": _extract_java_methods(text),
        "imports": _collect_imports_java(text),
    }
    return meta


def _extract_java_package(text: str) -> str:
    m = re.search(r"^\s*package\s+([\w.]+)\s*;", text, re.MULTILINE)
    return m.group(1) if m else ""


def _extract_java_class_declaration(text: str) -> str:
    m = re.search(
        r"(?:public\s+)?(?:abstract\s+|final\s+)?(class|interface|enum)\s+\w+"
        r"(?:<[^>]*>)?"
        r"(?:\s+extends\s+[\w.<>,\s]+?)?"
        r"(?:\s+implements\s+[\w.<>,\s]+?)?\s*\{",
        text,
    )
    return m.group(0).rstrip(" {").strip() if m else ""


def _extract_java_class_annotations(text: str) -> list[str]:
    """Grab annotations immediately preceding the first class/interface/enum declaration."""
    m = re.search(r"(class|interface|enum)\s+\w+", text)
    if not m:
        return []
    before = text[: m.start()]
    anns: list[str] = []
    for am in re.finditer(r"@(\w+)(?:\(([^)]*)\))?", before.splitlines()[-10:] if before.splitlines() else ""):
        anns.append(am.group(0))
    # Rerun on the joined last lines to be safe
    tail = "\n".join(before.splitlines()[-15:])
    anns = [am.group(0) for am in re.finditer(r"@\w+(?:\([^)]*\))?", tail)]
    return anns


def _extract_java_fields(text: str) -> list[dict]:
    fields: list[dict] = []
    # Very naive: look for lines like "    [annotations] [modifiers] Type name[= ...];"
    pattern = re.compile(
        r"^\s+(?P<annotations>(?:@\w+(?:\([^)]*\))?\s+)*)"
        r"(?:private|public|protected)?\s*(?:static\s+)?(?:final\s+)?"
        r"(?P<type>[\w.<>,?\s\[\]]+?)\s+(?P<name>\w+)\s*(?:=[^;]*)?;",
        re.MULTILINE,
    )
    for m in pattern.finditer(text):
        type_ = re.sub(r"\s+", " ", m.group("type")).strip()
        name = m.group("name")
        anns = m.group("annotations").strip()
        if name in ("return", "throw", "new", "if", "else", "for", "while"):
            continue
        if not type_ or type_ in ("return", "throw"):
            continue
        fields.append({
            "name": name,
            "type": type_,
            "annotations": [a.strip() for a in re.findall(r"@\w+(?:\([^)]*\))?", anns)],
        })
        if len(fields) >= 40:
            break
    return fields


def _extract_java_methods(text: str) -> list[dict]:
    methods: list[dict] = []
    pattern = re.compile(
        r"^\s+(?P<annotations>(?:@\w+(?:\([^)]*\))?\s+)*)"
        r"(?:public|protected)\s+(?:static\s+)?(?:final\s+)?"
        r"(?P<ret>[\w.<>,?\s\[\]]+?)\s+(?P<name>\w+)\s*\((?P<params>[^)]*)\)"
        r"(?:\s+throws\s+[\w.,\s]+)?\s*\{",
        re.MULTILINE,
    )
    for m in pattern.finditer(text):
        ret = re.sub(r"\s+", " ", m.group("ret")).strip()
        name = m.group("name")
        params = re.sub(r"\s+", " ", m.group("params")).strip()
        anns_text = m.group("annotations") or ""
        anns = [a.strip() for a in re.findall(r"@\w+(?:\([^)]*\))?", anns_text)]
        methods.append({
            "name": name,
            "ret": ret,
            "params": params,
            "annotations": anns,
        })
        if len(methods) >= 40:
            break
    return methods


# ------------------------- Config extractors ------------------------- #

def extract_package_json(path: Path, text: str) -> dict:
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return {"error": "invalid JSON"}
    return {
        "name": data.get("name"),
        "version": data.get("version"),
        "description": data.get("description"),
        "type": data.get("type"),
        "main": data.get("main"),
        "scripts": data.get("scripts", {}),
        "dependencies_count": len(data.get("dependencies", {}) or {}),
        "devDependencies_count": len(data.get("devDependencies", {}) or {}),
        "notable_deps": _notable_deps(data),
    }


def _notable_deps(pkg: dict) -> list[str]:
    deps = {**(pkg.get("dependencies") or {}), **(pkg.get("devDependencies") or {})}
    notable_keys = {
        "@angular/core", "react", "vue", "next", "nuxt", "svelte",
        "express", "fastify", "@nestjs/core",
        "typescript", "vite", "webpack",
        "jest", "vitest", "playwright", "cypress",
        "@prisma/client", "typeorm", "sequelize", "mongoose",
        "tailwindcss", "@mui/material",
    }
    return [f"{k}@{v}" for k, v in deps.items() if k in notable_keys]


def extract_tsconfig(path: Path, text: str) -> dict:
    # Strip trailing commas / comments for best-effort parse
    clean = re.sub(r"//.*", "", text)
    clean = re.sub(r",(\s*[}\]])", r"\1", clean)
    try:
        data = json.loads(clean)
    except json.JSONDecodeError:
        return {"error": "could not parse JSONC"}
    co = data.get("compilerOptions", {}) or {}
    return {
        "extends": data.get("extends"),
        "target": co.get("target"),
        "module": co.get("module"),
        "moduleResolution": co.get("moduleResolution"),
        "strict": co.get("strict"),
        "paths": co.get("paths"),
        "include": data.get("include"),
        "exclude": data.get("exclude"),
        "references": data.get("references"),
    }


def extract_dockerfile(path: Path, text: str) -> dict:
    directives: list[dict] = []
    for line in text.splitlines():
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        m = re.match(r"^(FROM|RUN|CMD|ENTRYPOINT|COPY|ADD|WORKDIR|ENV|EXPOSE|USER|VOLUME|ARG|LABEL)\b(.*)", s, re.IGNORECASE)
        if m:
            directives.append({"directive": m.group(1).upper(), "args": m.group(2).strip()})
    return {"directives": directives, "line_count": len(text.splitlines())}


def extract_docker_compose(path: Path, text: str) -> dict:
    # Very simple YAML-ish parse — just find `services:` and list top-level service names
    services: list[str] = []
    in_services = False
    base_indent: int | None = None
    for line in text.splitlines():
        if re.match(r"^services\s*:\s*$", line):
            in_services = True
            continue
        if in_services:
            if not line.strip():
                continue
            stripped = line.lstrip(" ")
            indent = len(line) - len(stripped)
            if base_indent is None and stripped and not stripped.startswith("#"):
                base_indent = indent
            if indent == base_indent and stripped.endswith(":"):
                services.append(stripped.rstrip(":").strip())
            elif indent < (base_indent or 0) and stripped and not stripped.startswith("#"):
                in_services = False
    return {"services": services, "line_count": len(text.splitlines())}


# ----------------------------- dispatch ----------------------------- #

def classify_file(path: Path, text: str) -> str:
    name = path.name
    suffix = path.suffix.lower()
    if name == "package.json":
        return "package.json"
    if name.startswith("tsconfig") and suffix == ".json":
        return "tsconfig"
    if name == "Dockerfile" or name.lower() == "dockerfile":
        return "dockerfile"
    if re.match(r"^(docker-)?compose.*\.ya?ml$", name):
        return "docker-compose"
    if suffix in (".ts", ".tsx", ".js", ".jsx"):
        if re.search(r"@Component\s*\(", text):
            return "angular-component"
        if re.search(r"@Injectable\s*\(", text):
            return "angular-service"
        if re.search(r"@Directive\s*\(", text):
            return "angular-directive"
        if re.search(r"@Pipe\s*\(", text):
            return "angular-pipe"
        return "typescript-source"
    if suffix == ".java":
        return "java-class"
    return "unknown"


def extract(path: Path, forced_type: str | None = None) -> dict:
    text = _read(path)
    if not text:
        return {
            "path": str(path),
            "type": "unknown",
            "success": False,
            "error": "empty or unreadable file",
            "metadata": {"first_lines": []},
        }

    kind = forced_type or classify_file(path, text)

    try:
        if kind == "angular-component":
            meta = extract_angular_component(path, text)
        elif kind == "angular-service":
            meta = extract_angular_service(path, text)
        elif kind in ("angular-directive", "angular-pipe"):
            # Reuse the service extractor — good enough for these
            meta = extract_angular_service(path, text)
        elif kind == "java-class":
            meta = extract_java_class(path, text)
        elif kind == "package.json":
            meta = extract_package_json(path, text)
        elif kind == "tsconfig":
            meta = extract_tsconfig(path, text)
        elif kind == "dockerfile":
            meta = extract_dockerfile(path, text)
        elif kind == "docker-compose":
            meta = extract_docker_compose(path, text)
        else:
            return {
                "path": str(path),
                "type": kind,
                "success": False,
                "error": f"no extractor for type '{kind}'",
                "metadata": {"first_lines": _first_lines(text)},
            }
    except Exception as e:  # extraction should never blow up the whole skill
        return {
            "path": str(path),
            "type": kind,
            "success": False,
            "error": f"extractor raised: {e}",
            "metadata": {"first_lines": _first_lines(text)},
        }

    return {
        "path": str(path),
        "type": kind,
        "success": True,
        "metadata": meta,
    }


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print("usage: extract_metadata.py PATH [--type TYPE]", file=sys.stderr)
        return 2

    forced_type: str | None = None
    if "--type" in args:
        idx = args.index("--type")
        if idx + 1 < len(args):
            forced_type = args[idx + 1]
            args = args[:idx] + args[idx + 2:]

    target = Path(args[0])
    if not target.exists():
        print(json.dumps({"error": f"file not found: {target}"}), file=sys.stderr)
        return 2

    result = extract(target, forced_type)
    print(json.dumps(result, indent=2, ensure_ascii=False, default=str))
    return 0 if result.get("success") else 1


if __name__ == "__main__":
    sys.exit(main())
