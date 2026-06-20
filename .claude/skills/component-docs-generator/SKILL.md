---
name: component-docs-generator
description: Use this skill when the user asks to document EVERY source file of a project in detail, one by one. Triggers include "documentar componente por componente", "documentá cada archivo", "documentación al detalle", "per-file documentation", "detailed technical docs", "document every component", "quiero doc de cada clase/servicio/DTO", or any request that mentions documenting individual files rather than an overall project description. Produces a single beautifully formatted PDF (preferred), DOCX (fallback), or Markdown (final fallback) that contains one subsection per relevant file with its signature, dependencies, purpose, and usage. Works for Angular (.ts + .html + .scss components, services, directives, pipes, guards), Java/Kotlin (controllers, services, DTOs, entities, configs), Node/TypeScript backends, Python projects, and their configuration files. Do NOT use this skill for a high-level project overview — use `project-docs-generator` for that instead. Do NOT use for README updates or inline chat explanations — this skill always produces a downloadable document file.
---

# Component Documentation Generator

## Overview

This skill produces one document that contains a dedicated subsection per relevant source file in the project. Each subsection follows a strict template (Path, Type, Purpose, Signature, Dependencies, Used by, Notes) defined in `references/file-template.md`.

The output file goes to `./docs/generated/<repo>-componentes-<YYYYMMDD>.<pdf|docx|md>`. The skill inspects the repo, enumerates and classifies files, extracts metadata, writes an intermediate Markdown file, and converts it through the same fallback chain as `project-docs-generator` (weasyprint → Chrome headless → pandoc DOCX → python-docx DOCX → raw Markdown).

## When to use this skill

Use when the user asks for:
- "documentá cada componente / archivo / clase"
- "doc al detalle de todos los archivos"
- "per-file technical documentation"
- "generar un PDF con todos los componentes explicados"

Do NOT use when the user asks for:
- A high-level project overview (use `project-docs-generator`)
- Documentation of only one specific file (just answer in chat)
- README updates

## Workflow

Follow these steps in order. Do not skip any.

### Step 1 — Read prerequisites

Read these files if they exist (in the target repo):
1. `AGENTS.md`
2. `CLAUDE.md`
3. `README.md`

If the user previously ran `project-docs-generator`, the result exists at `./docs/generated/`. You can use it as context to avoid repeating the overall architecture in this document — this skill focuses on files, not on the big picture.

### Step 2 — Enumerate and classify files

From the repo root:

```bash
python "$CLAUDE_SKILL_DIR/scripts/enumerate_files.py" . > /tmp/files.json
```

If `$CLAUDE_SKILL_DIR` is not set, use the actual path to this skill directory (typically `.claude/skills/component-docs-generator`).

Parse the JSON. It contains:
- `total` — total count of relevant files
- `by_type` — files grouped by classified type (angular-component, angular-service, java-controller, etc.)
- `by_module` — files grouped by inferred module/feature folder
- `skipped` — excluded files with the reason
- `warnings` — any volume warnings

### Step 3 — Check volume and confirm with user if needed

Apply volume rules from `references/classification-rules.md`:

- If `total <= 200`: proceed to produce a single document.
- If `200 < total <= 500`: warn the user in chat and **ask for confirmation** before continuing. Offer to split by module.
- If `total > 500`: **stop** and tell the user to either narrow the scope (e.g. to a specific subdirectory) or accept a split-by-module output. Do not proceed without explicit approval.

If the user agrees to split by module, generate one document per entry in `by_module` and save them to `./docs/generated/componentes-<YYYYMMDD>/<module>.<ext>`.

### Step 4 — Plan extraction using TodoWrite

Create a TodoWrite list with one todo per module (or per batch of ~20 files if modules are too coarse). Mark each as pending. You will mark them done as you finish each module's subsection.

### Step 5 — Extract metadata per file (batched parallel reads)

For each file in the enumerated list, you need: path, type, purpose, signature, dependencies, usage. Two sources:

**Source A — `extract_metadata.py` (fast path for supported types)**

```bash
python "$CLAUDE_SKILL_DIR/scripts/extract_metadata.py" <path-to-file> > /tmp/meta.json
```

Supported types: angular-component TS, angular-service TS, java-controller, java-service, java-dto/entity, package.json, tsconfig.json, angular.json, Dockerfile, docker-compose.yml, application.properties.

**Source B — read the file yourself (fallback for anything else)**

Use the Read tool for anything `extract_metadata.py` did not handle: HTML templates, SCSS, migrations, SQL, shell scripts, etc. Keep reads focused — for templates and styles, a 50-line head is usually enough to describe the structure.

**Batching rule**: read files in parallel batches of up to 10 at a time. Do not read one file, think, read another, think. Plan the batch, fire all reads, then synthesize.

### Step 6 — Write the intermediate Markdown

Write to `/tmp/component-doc.md`. Structure:

```markdown
# <Repo Name>

> **Documentación de Componentes**
> Versión: <git-sha-o-tag>
> Fecha: <YYYY-MM-DD>
> Archivos documentados: <total>
> Generado por: component-docs-generator skill

---

## Resumen

Tabla: `Tipo de archivo | Cantidad | % del total`.

## Mapa de módulos

One Mermaid `flowchart TB` diagram with one subgraph per module. Inside each subgraph, list up to 8 representative file names. If a module has more than 8 files, show 7 + one node labelled `"... (+N archivos)"`.

## <Módulo 1>

### <nombre-del-archivo-1>

<Use the exact template from references/file-template.md>

### <nombre-del-archivo-2>

<Same template>

## <Módulo 2>
...
```

For the per-file template rules, see `references/file-template.md`. Do not deviate from the template — the same 6 fields in the same order for every file.

### Step 7 — Append the omitted-files appendix

At the end of the document, append:

```markdown
## Apéndice A — Archivos omitidos

| Archivo | Razón |
|---------|-------|
| ...     | ...   |
```

Populate from `files.json.skipped`. Group identical reasons together when the list is long.

### Step 8 — Append the file-type inventory

```markdown
## Apéndice B — Inventario por tipo

### angular-component (12 archivos)
- src/app/features/cart/cart.component.ts
- src/app/features/checkout/checkout.component.ts
- ...

### angular-service (8 archivos)
- ...
```

### Step 9 — Build the final document

```bash
python "$CLAUDE_SKILL_DIR/scripts/build_document.py" /tmp/component-doc.md \
  --output-dir ./docs/generated \
  --title "<repo> — Documentación de Componentes" \
  --stem "<repo>-componentes-$(date +%Y%m%d)" \
  --format auto
```

The build script is identical to the one in `project-docs-generator` (same fallback chain, same Mermaid handling, same CSS theme). It is bundled here so this skill is self-contained and droppable.

### Step 10 — Report to the user

Tell the user:
1. Final file count documented, skipped, and grouped by type.
2. Which format was produced (PDF / DOCX / MD) and by which backend.
3. Absolute path(s) to the generated file(s).
4. Any volume warnings or split decisions.
5. If PDF failed, which dependency to install next time.

## Dependencies

Same as `project-docs-generator`. All optional:

| Tool | Purpose | Install |
|------|---------|---------|
| `weasyprint` | Best-quality PDF from HTML+CSS | `pip install weasyprint` |
| `markdown` (Python) | Markdown → HTML | `pip install markdown pygments` |
| `mmdc` | Render Mermaid → SVG | `npm install -g @mermaid-js/mermaid-cli` |
| Chromium/Chrome | PDF fallback | system package |
| `pandoc` | DOCX fallback | system package |
| `python-docx` | Final DOCX fallback | `pip install python-docx` |

## Reference files

- `references/file-template.md` — Canonical per-file subsection template.
- `references/classification-rules.md` — Inclusion/exclusion rules and file-type definitions.
- `references/extraction-guide.md` — How to extract metadata per file type when `extract_metadata.py` does not handle the case.

## Low-entropy rules (hard constraints)

1. Never invent methods, signatures, annotations, or dependencies. If you cannot extract a field, write `—` or `No determinado`.
2. Never paraphrase the purpose of a file based on the file name alone. Read the file. If there are no comments and the name is ambiguous, write `Propósito no inferido automáticamente`.
3. Never document files excluded by `classification-rules.md`. If the user explicitly asks for tests, override only after confirmation.
4. Never use the same Markdown template variant for two file types — stick to the single canonical template in `references/file-template.md` and vary only the content of each field.
5. Never exceed 500 files without explicit user confirmation.
6. Never deduplicate identical-looking files that live in different paths — document each occurrence.
7. Every `## Módulo` heading must match a real directory name. Never invent module groupings.
8. The `Used by` field must cite real files you verified; if unknown, write `No determinado`.
