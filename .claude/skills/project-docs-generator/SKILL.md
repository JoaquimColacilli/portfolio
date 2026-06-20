---
name: project-docs-generator
description: Use this skill whenever the user asks to generate GENERAL project documentation, a project-level manual, an onboarding guide, an architecture overview, a README-on-steroids, or anything described as "documentación general del proyecto", "documentación técnica general", "manual del proyecto", "technical docs", "doc general de la app", "generar doc del repo", or "explicame qué hace el proyecto en un documento". Produces a beautifully formatted PDF (preferred), DOCX (fallback), or Markdown (final fallback) containing: executive summary, tech stack, architecture and integration diagrams in Mermaid, API/endpoints table, data model, environment variables, full installation and run manual, CI/CD flow, and troubleshooting. Do NOT use this skill for per-file or per-component documentation — use `component-docs-generator` for that instead. Do NOT use for README updates, short summaries inside chat, or quick answers — this skill always produces a downloadable document file.
---

# Project Documentation Generator

## Overview

This skill produces a single, beautifully formatted technical document that documents an ENTIRE project at a high level. Output is one file at `./docs/generated/<repo>-general-<YYYYMMDD>.<pdf|docx|md>` containing 17 required sections including Mermaid diagrams for architecture, data flow, integrations, data model, and CI/CD.

The skill is read-mostly: it inspects the repo, runs detection scripts, writes an intermediate Markdown file, and converts it via a fallback chain (weasyprint → Chrome headless → pandoc DOCX → python-docx DOCX → raw Markdown). It never modifies source code.

## When to use this skill

Use when the user asks for:
- "generá documentación general del proyecto" / "hacé un doc general"
- "manual del proyecto" / "onboarding doc" / "technical overview"
- "quiero un PDF que explique qué hace la app"
- "documentá el repo a alto nivel"

Do NOT use when the user asks for:
- Per-file/per-component documentation (use `component-docs-generator`)
- Short inline explanations in chat
- README.md edits to the source repo (this skill writes to `./docs/generated/`, not to the repo root)

## Workflow

Follow these steps in order. Do not skip steps.

### Step 1 — Read prerequisites

Read these files if they exist (in the target repo, not the skill directory):
1. `AGENTS.md`
2. `CLAUDE.md`
3. `README.md`
4. `CONTRIBUTING.md`

If any of them is relevant to installation, architecture, or conventions, use its content verbatim or paraphrased in the generated document.

### Step 2 — Run detection scripts

From the repo root, run:

```bash
python "$CLAUDE_SKILL_DIR/scripts/detect_stack.py" . > /tmp/stack.json
python "$CLAUDE_SKILL_DIR/scripts/scan_repo.py" . > /tmp/repo.json
```

If the `$CLAUDE_SKILL_DIR` variable is not set, use the actual path to the skill directory (e.g. `.claude/skills/project-docs-generator`).

Parse both JSON files and keep their content in working memory. These two files give you: detected stack, evidence files, folder tree, entrypoints, env files, routes, external integrations.

### Step 3 — Plan sections using TodoWrite

Create a TodoWrite list with exactly one todo per required section (see `references/document-sections.md` for the canonical list of 17 sections). Mark each as pending. You will mark them done as you write each one.

### Step 4 — Gather per-section evidence (parallel reads)

For sections that need additional evidence beyond the JSON, read the relevant files. Batch reads in parallel when possible. Typical reads:
- Build/run manual → `package.json` scripts, `Makefile`, `Dockerfile`, `docker-compose.yml`, `pom.xml`, `build.gradle`
- Env vars → `.env.example`, `application.properties`, `environment.ts`
- CI/CD → `.github/workflows/*.yml`, `Jenkinsfile`, `.gitlab-ci.yml`
- Data model → `*.entity.java`, `*.model.ts`, Prisma schema, TypeORM entities, migrations

### Step 5 — Write the intermediate Markdown

Create `/tmp/project-doc.md` with all 17 sections in the exact order specified in `references/document-sections.md`. Rules:

- One `# H1` only — the project title on the cover page.
- Every section is an `## H2`.
- Mermaid diagrams go inside fenced blocks: ` ```mermaid ` ... ` ``` `.
- Tables are standard Markdown (pipe tables), never HTML.
- Code blocks always declare language (` ```bash `, ` ```typescript `, etc.).
- Use real names from the repo. Never write placeholders like `ServiceA`, `ComponentB`, `TODO`, `TBD`.
- If a section has no evidence, omit it entirely and add its title to a final `## Secciones omitidas` section with a one-line reason.

For Mermaid syntax guidance, see `references/mermaid-patterns.md`.
For formatting rules, see `references/style-guide.md`.

### Step 6 — Build the final document

Run the build pipeline:

```bash
python "$CLAUDE_SKILL_DIR/scripts/build_document.py" /tmp/project-doc.md \
  --output-dir ./docs/generated \
  --title "<nombre-del-repo> — Documentación General" \
  --format auto
```

The build script will:
1. Find every ` ```mermaid ` block and render it to SVG via `mmdc` if available.
2. Convert the Markdown + SVGs to HTML with the CSS theme at `assets/pdf-theme.css`.
3. Try to produce a PDF via weasyprint; if unavailable or it fails, try Chrome/Chromium headless.
4. If PDF fails, try DOCX via pandoc; if unavailable, try python-docx.
5. If everything fails, dump the processed Markdown to `./docs/generated/<repo>-general-<YYYYMMDD>.md`.

The script prints `FILE: <absolute-path>` lines at the end. Capture those and report them to the user.

### Step 7 — Report to the user

Tell the user:
1. Which format was produced (PDF / DOCX / MD) and why (if it wasn't PDF, say which backend failed).
2. The absolute path to the generated file.
3. How many Mermaid diagrams were rendered.
4. Any sections that were omitted and why.
5. If PDF generation failed, tell them what to install to get PDF next time:
   - `pip install weasyprint markdown pygments` (best path)
   - or `npm install -g @mermaid-js/mermaid-cli` (for diagram rendering)
   - or install Chromium / Google Chrome for the headless fallback

## Dependencies

Optional (the skill degrades gracefully):

| Tool | Purpose | Install |
|------|---------|---------|
| `weasyprint` | Best-quality PDF from HTML+CSS | `pip install weasyprint` |
| `markdown` (Python) | Markdown → HTML | `pip install markdown pygments` |
| `mmdc` | Render Mermaid → SVG | `npm install -g @mermaid-js/mermaid-cli` |
| Chromium/Chrome | PDF fallback (headless) | system package |
| `pandoc` | DOCX fallback | system package |
| `python-docx` | Final DOCX fallback | `pip install python-docx` |

The skill works with zero dependencies — it will at minimum produce a valid Markdown file. Install as many as possible for the best output.

## Reference files

- `references/document-sections.md` — The 17 required sections, their exact order, and what goes in each.
- `references/mermaid-patterns.md` — Mermaid templates for each diagram type used in the document.
- `references/style-guide.md` — Formatting conventions, headings, tables, code blocks, naming rules.

## Low-entropy rules (hard constraints)

1. Never invent technology that is not detected in `stack.json` or visible in the repo.
2. Never describe endpoints that are not in `repo.json` or directly grep-able.
3. Never leave `TODO` / `TBD` placeholders in the output document.
4. Never reorder the 17 required sections.
5. Never use emoji in the final document (the skill's own files can, but the generated PDF/DOCX cannot).
6. Never overwrite existing files in `./docs/generated/` without a new date suffix.
7. Always include the evidence files list (from `stack.json`) in an appendix so the document is auditable.
8. Every Mermaid diagram must use real names from the repo. If you cannot produce a diagram with real names for a given section, omit the diagram and add the section to `Secciones omitidas`.
