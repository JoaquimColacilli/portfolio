# Classification Rules — Component Documentation

Rules for deciding which files to include in the per-file documentation and which to exclude.

## Include by default

These file patterns are documented automatically:

### Source code

| Pattern | Type hint |
|---------|-----------|
| `**/*.ts` (except `*.spec.ts`, `*.test.ts`, `*.d.ts`) | TypeScript source |
| `**/*.tsx` (except `*.spec.tsx`, `*.test.tsx`) | React component |
| `**/*.js` (except `*.spec.js`, `*.test.js`, `*.min.js`) | JavaScript source |
| `**/*.jsx` | React component |
| `**/*.html` (only if paired with a `.ts` or `.component.ts` sibling) | Angular template |
| `**/*.scss`, `**/*.css` (only if paired with a `.ts` sibling) | Angular style |
| `**/*.java` (except `**/test/**`, `**/*Test.java`) | Java source |
| `**/*.kt` (except `**/test/**`) | Kotlin source |
| `**/*.py` (except `**/tests/**`, `**/test_*.py`, `**/*_test.py`) | Python source |
| `**/*.go` (except `**/*_test.go`) | Go source |

### Configuration

| Pattern | Type |
|---------|------|
| `package.json` (at any depth, but never inside `node_modules`) | config-file |
| `tsconfig*.json` | config-file |
| `angular.json`, `nx.json`, `project.json` | config-file |
| `pom.xml`, `build.gradle`, `build.gradle.kts`, `settings.gradle` | config-file |
| `pyproject.toml`, `requirements.txt`, `setup.py`, `setup.cfg` | config-file |
| `go.mod`, `Cargo.toml` | config-file |
| `Dockerfile`, `docker-compose*.yml`, `compose*.yml` | docker-file |
| `.env.example`, `.env.sample`, `.env.template` | env-file |
| `application.properties`, `application.yml`, `application-*.yml` | env-file |
| `src/environments/environment*.ts` | env-file |
| `.github/workflows/*.yml`, `.github/workflows/*.yaml` | ci-file |
| `Jenkinsfile`, `.gitlab-ci.yml`, `bitbucket-pipelines.yml` | ci-file |
| `**/migrations/*.sql`, `**/migrations/*.java` | sql-migration |
| `**/*.liquibase.xml`, `**/changelog*.xml` | sql-migration |

## Exclude by default

These are ALWAYS skipped:

### Directories (path contains any of these parts)

```
node_modules
.git
.svn
.hg
dist
build
target
out
.next
.nuxt
.angular
.svelte-kit
coverage
.nyc_output
__pycache__
.pytest_cache
.tox
.venv
venv
env
.idea
.vscode
.gradle
.mvn
vendor
bower_components
.cache
.parcel-cache
tmp
temp
```

### File patterns

| Pattern | Reason |
|---------|--------|
| `**/*.spec.ts`, `**/*.spec.js`, `**/*.spec.tsx` | Test files |
| `**/*.test.ts`, `**/*.test.js`, `**/*.test.tsx` | Test files |
| `**/test_*.py`, `**/*_test.py` | Python tests |
| `**/*Test.java`, `**/*Tests.java`, `**/*IT.java` | Java tests |
| `**/*_test.go` | Go tests |
| `**/*.min.js`, `**/*.min.css` | Minified bundles |
| `**/*.map` | Source maps |
| `**/*.d.ts` (except `**/types/**/*.d.ts` in project src) | Generated type declarations |
| `**/*.lock`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` | Lock files |
| `**/*.log`, `**/*.tmp` | Temporary files |
| `**/*.png`, `**/*.jpg`, `**/*.svg` (except if ≤ 5 total in repo) | Binary assets |
| `**/*.woff`, `**/*.woff2`, `**/*.ttf`, `**/*.eot` | Font binaries |
| `LICENSE`, `LICENCE`, `COPYING`, `NOTICE` | License files |
| `CHANGELOG.md`, `HISTORY.md` | Auto-generated history |
| `**/*.generated.*` | Generated code |

### Exclude conditionally

These are excluded by default but included if the user explicitly asks:

- **Test files**: excluded unless user says "incluí los tests" / "include tests" — then reclassify `.spec.ts` as `angular-test` and `.test.ts` as `typescript-test`.
- **`README.md`, `CONTRIBUTING.md`, `*.md`**: excluded unless user says "incluí la documentación existente".
- **Generated code (files with `.generated.` or `// AUTO-GENERATED` in first 3 lines)**: excluded unless user says "incluí los archivos generados".

## Classification logic

`enumerate_files.py` applies this decision tree in order:

1. Path matches an exclude directory → skip with reason `"excluded directory"`.
2. Filename matches an exclude pattern → skip with reason `"excluded by pattern"`.
3. File size > 500 KB → skip with reason `"file too large (> 500 KB)"`.
4. File is binary (first 1 KB contains null bytes) → skip with reason `"binary file"`.
5. File matches an include pattern → classify by type and include.
6. File does not match any include pattern → skip with reason `"not in include list"`.

## Classification priorities

When a file matches multiple patterns, these priorities apply:

1. **Directory-based classification wins over suffix**. A `.ts` file inside `src/app/guards/` is classified as `angular-guard` even if its name doesn't end in `.guard.ts`.
2. **Decorator-based classification wins over filename**. A `.ts` file with `@Injectable` is `angular-service` regardless of the filename.
3. **Naming convention fallback**. If no decorators are detected, use filename suffix: `*.component.ts` → `angular-component`, `*.service.ts` → `angular-service`, `*.guard.ts` → `angular-guard`, `*.pipe.ts` → `angular-pipe`, `*.directive.ts` → `angular-directive`, `*.module.ts` → `angular-module`, `*.resolver.ts` → `angular-resolver`, `*.interceptor.ts` → `angular-interceptor`, `*.model.ts` / `*.dto.ts` / `*.interface.ts` → `typescript-model`, `*.utils.ts` / `*.helpers.ts` → `typescript-util`.
4. **Default to `unknown`** if nothing matches.

## Module inference

`enumerate_files.py` groups files into modules using this logic:

1. For each file, walk up the directory tree until you find one of:
   - `src/app/features/<module>/` → module = `features/<module>`
   - `src/app/core/` → module = `core`
   - `src/app/shared/` → module = `shared`
   - `src/main/java/<groupId>/<artifactId>/<module>/` → module = `<module>`
   - `src/<module>/` → module = `src/<module>`
2. If no clear module boundary exists, use the first-level directory under `src/`.
3. If the file is at the repo root or in a directory with no parent src, module = `root`.

## Volume thresholds

| Files | Action |
|-------|--------|
| `total <= 200` | Produce one single document |
| `200 < total <= 500` | Warn the user and ask confirmation |
| `total > 500` | Stop and require user to narrow scope or approve split |

Splits always happen by module boundary, never mid-module. When splitting, one output file per module, named `<module-slug>.pdf`.

## Zero-file edge case

If `total == 0` after classification (e.g. user ran the skill on an empty repo), produce a document with just the cover page, the file-count table (showing zeros), and a note: `No se encontraron archivos relevantes para documentar en este directorio.`.
