#!/usr/bin/env python3
"""
detect_stack.py — Detect the tech stack of a project by inspecting marker files.

Usage:
    python detect_stack.py [ROOT_DIR]

Outputs JSON to stdout. Exit code 0 if any frontend/backend was detected, 1 otherwise.

Zero third-party dependencies. Safe to run on any machine with Python 3.8+.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

IGNORE_DIRS = {
    "node_modules", ".git", "dist", "build", "target", ".next",
    "coverage", "__pycache__", ".venv", "venv", ".mvn", ".gradle",
    ".idea", ".vscode", ".angular", "out", ".nuxt", ".svelte-kit",
}


def _should_skip(path: Path) -> bool:
    return any(part in IGNORE_DIRS for part in path.parts)


def detect(root: Path) -> dict:
    detected: dict = {
        "root": str(root),
        "frontend": [],
        "backend": [],
        "languages": [],
        "build_tools": [],
        "package_managers": [],
        "databases": [],
        "testing": [],
        "containerization": [],
        "ci_cd": [],
        "evidence": {},
    }

    def add(category: str, name: str, file: Path) -> None:
        if name not in detected[category]:
            detected[category].append(name)
        rel = str(file.relative_to(root))
        detected["evidence"].setdefault(name, [])
        if rel not in detected["evidence"][name]:
            detected["evidence"][name].append(rel)

    # --- Pass 1: look at marker files, limited depth for speed --- #
    for path in root.rglob("*"):
        if _should_skip(path) or not path.is_file():
            continue
        name = path.name

        # Frontend frameworks
        if name == "angular.json":
            add("frontend", "Angular", path)
            add("build_tools", "Angular CLI", path)
        elif name == "next.config.js" or name == "next.config.mjs" or name == "next.config.ts":
            add("frontend", "Next.js", path)
        elif name == "nuxt.config.ts" or name == "nuxt.config.js":
            add("frontend", "Nuxt", path)
        elif name == "svelte.config.js":
            add("frontend", "Svelte / SvelteKit", path)
        elif name == "vite.config.ts" or name == "vite.config.js":
            add("build_tools", "Vite", path)
        elif name == "webpack.config.js":
            add("build_tools", "Webpack", path)

        # package.json — inspect dependencies
        elif name == "package.json":
            add("package_managers", "npm (package.json)", path)
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                deps = {**data.get("dependencies", {}),
                        **data.get("devDependencies", {})}
                dep_names = set(deps.keys())

                frontend_map = {
                    "@angular/core": "Angular",
                    "react": "React",
                    "vue": "Vue",
                    "svelte": "Svelte",
                    "next": "Next.js",
                    "nuxt": "Nuxt",
                    "@remix-run/react": "Remix",
                    "solid-js": "SolidJS",
                }
                backend_map = {
                    "express": "Express (Node.js)",
                    "fastify": "Fastify (Node.js)",
                    "@nestjs/core": "NestJS",
                    "koa": "Koa (Node.js)",
                    "hapi": "Hapi (Node.js)",
                    "@hapi/hapi": "Hapi (Node.js)",
                }
                build_map = {
                    "typescript": "TypeScript",
                    "vite": "Vite",
                    "webpack": "Webpack",
                    "esbuild": "esbuild",
                    "rollup": "Rollup",
                    "parcel": "Parcel",
                    "turbo": "Turborepo",
                    "nx": "Nx",
                }
                test_map = {
                    "jest": "Jest",
                    "vitest": "Vitest",
                    "mocha": "Mocha",
                    "jasmine": "Jasmine",
                    "karma": "Karma",
                    "@playwright/test": "Playwright",
                    "cypress": "Cypress",
                    "@testing-library/react": "React Testing Library",
                    "@angular/testing": "Angular Testing",
                }
                db_map = {
                    "pg": "PostgreSQL",
                    "mysql2": "MySQL",
                    "mysql": "MySQL",
                    "mongodb": "MongoDB",
                    "mongoose": "MongoDB (Mongoose)",
                    "@prisma/client": "Prisma ORM",
                    "typeorm": "TypeORM",
                    "sequelize": "Sequelize",
                    "ioredis": "Redis",
                    "redis": "Redis",
                }

                for k, v in frontend_map.items():
                    if k in dep_names:
                        add("frontend", v, path)
                for k, v in backend_map.items():
                    if k in dep_names:
                        add("backend", v, path)
                for k, v in build_map.items():
                    if k in dep_names:
                        add("build_tools", v, path)
                for k, v in test_map.items():
                    if k in dep_names:
                        add("testing", v, path)
                for k, v in db_map.items():
                    if k in dep_names:
                        add("databases", v, path)

                if "typescript" in dep_names:
                    add("languages", "TypeScript", path)
                if any(k in dep_names for k in ("react", "vue", "@angular/core", "svelte")):
                    add("languages", "JavaScript / TypeScript", path)
            except (json.JSONDecodeError, OSError):
                pass

        # Java / Kotlin
        elif name == "pom.xml":
            add("backend", "Java (Maven)", path)
            add("languages", "Java", path)
            add("package_managers", "Maven", path)
            try:
                content = path.read_text(encoding="utf-8", errors="ignore")
                if "spring-boot" in content:
                    add("backend", "Spring Boot", path)
                if "quarkus" in content:
                    add("backend", "Quarkus", path)
                if "micronaut" in content:
                    add("backend", "Micronaut", path)
                if "hibernate" in content:
                    add("databases", "Hibernate ORM", path)
                if "postgresql" in content.lower():
                    add("databases", "PostgreSQL", path)
                if "mysql" in content.lower():
                    add("databases", "MySQL", path)
                if "mongo" in content.lower():
                    add("databases", "MongoDB", path)
                if "junit" in content.lower():
                    add("testing", "JUnit", path)
            except OSError:
                pass
        elif name in ("build.gradle", "build.gradle.kts"):
            add("backend", "Java/Kotlin (Gradle)", path)
            add("package_managers", "Gradle", path)
            try:
                content = path.read_text(encoding="utf-8", errors="ignore")
                if "spring-boot" in content:
                    add("backend", "Spring Boot", path)
                if "kotlin" in content:
                    add("languages", "Kotlin", path)
                else:
                    add("languages", "Java", path)
            except OSError:
                pass

        # Python
        elif name == "pyproject.toml":
            add("languages", "Python", path)
            add("package_managers", "pip/poetry/uv", path)
            try:
                content = path.read_text(encoding="utf-8", errors="ignore").lower()
                if "fastapi" in content:
                    add("backend", "FastAPI", path)
                if "flask" in content:
                    add("backend", "Flask", path)
                if "django" in content:
                    add("backend", "Django", path)
                if "pytest" in content:
                    add("testing", "pytest", path)
            except OSError:
                pass
        elif name == "requirements.txt":
            add("languages", "Python", path)
            try:
                content = path.read_text(encoding="utf-8", errors="ignore").lower()
                if "fastapi" in content:
                    add("backend", "FastAPI", path)
                if "flask" in content:
                    add("backend", "Flask", path)
                if "django" in content:
                    add("backend", "Django", path)
                if "pytest" in content:
                    add("testing", "pytest", path)
            except OSError:
                pass

        # Go / Rust / .NET
        elif name == "go.mod":
            add("backend", "Go", path)
            add("languages", "Go", path)
            add("package_managers", "go modules", path)
        elif name == "Cargo.toml":
            add("backend", "Rust", path)
            add("languages", "Rust", path)
            add("package_managers", "cargo", path)
        elif name.endswith(".csproj") or name.endswith(".sln"):
            add("backend", ".NET", path)
            add("languages", "C#", path)

        # Databases via config files
        elif name in ("schema.prisma",):
            add("databases", "Prisma ORM", path)

        # Containerization
        elif name == "Dockerfile":
            add("containerization", "Docker", path)
        elif name in ("docker-compose.yml", "docker-compose.yaml", "compose.yml"):
            add("containerization", "docker-compose", path)
        elif name == "Chart.yaml":
            add("containerization", "Helm", path)

        # CI/CD
        elif "workflows" in path.parts and name.endswith((".yml", ".yaml")) and ".github" in path.parts:
            add("ci_cd", "GitHub Actions", path)
        elif name == "Jenkinsfile":
            add("ci_cd", "Jenkins", path)
        elif name == ".gitlab-ci.yml":
            add("ci_cd", "GitLab CI", path)
        elif name in ("bitbucket-pipelines.yml",):
            add("ci_cd", "Bitbucket Pipelines", path)
        elif name in (".circleci", "config.yml") and ".circleci" in path.parts:
            add("ci_cd", "CircleCI", path)

    # Normalize ordering
    for k in ("frontend", "backend", "languages", "build_tools", "package_managers",
              "databases", "testing", "containerization", "ci_cd"):
        detected[k].sort()

    return detected


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    if not root.exists():
        print(json.dumps({"error": f"root does not exist: {root}"}), file=sys.stderr)
        return 2
    result = detect(root)
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0 if (result["frontend"] or result["backend"]) else 1


if __name__ == "__main__":
    sys.exit(main())
