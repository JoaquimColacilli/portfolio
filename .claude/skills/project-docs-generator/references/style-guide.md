# Style Guide — Project Documentation

Visual and formatting rules for the Markdown that `project-docs-generator` writes. These rules exist so the downstream conversion to PDF/DOCX produces a professional, consistent document.

## Heading hierarchy

Strict hierarchy. Do not skip levels.

| Level | Used for | Example |
|-------|----------|---------|
| `#` H1 | Project title (once per document, on cover page) | `# MFI — Personal Finance` |
| `##` H2 | Each of the 17 required sections | `## 3. Arquitectura de alto nivel` |
| `###` H3 | Subsections inside a section | `### Prerequisitos del sistema` |
| `####` H4 | Rare, only for nested lists of named items | `#### Variables de entorno de desarrollo` |

Never emit more than one `# H1`. Never use `#####` or deeper.

## Section numbering

Every H2 for sections 1–17 begins with its number and a period: `## 1. Resumen ejecutivo`. The cover-page H1 has no number.

## Text voice and tense

- Use neutral, technical Spanish (rioplatense is fine but avoid slang).
- Third person, present tense. "El servicio consume la API X", not "Nosotros consumimos".
- Short sentences. Max 25 words per sentence when possible.
- Explicitly name things: "el componente `PackageWizardComponent`", not "el componente principal".

## Tables

- Pipe tables only. Never HTML tables.
- Always include a header row.
- Keep rows to a single logical line; wrap long cells with `<br>` only as a last resort.
- Max 6 columns. If more columns are needed, split into two tables.

```markdown
| Variable | Tipo | Default | Requerida | Descripción |
|----------|------|---------|-----------|-------------|
| API_URL  | URL  | —       | ✓         | Base URL del BFF |
| LOG_LEVEL| enum | info    | ✗         | debug / info / warn / error |
```

## Code blocks

- Always declare the language.
- Prefer shell-copy-ready commands in `bash` blocks.
- For long output, truncate with `# ...` and a comment.

```markdown
\`\`\`bash
npm install
npm run dev
\`\`\`

\`\`\`typescript
export class UserService {
  constructor(private http: HttpClient) {}
}
\`\`\`
```

## Lists

- Use `-` for unordered lists, `1.` for ordered.
- Capitalize the first letter of each item.
- End items with a period only if the item is a full sentence.
- Nest with 2-space indentation.

## Emphasis

- `**bold**` only for table headers, warnings, and the first mention of a key concept.
- `*italic*` only for file paths and variable names that are not in code spans.
- Prefer inline code spans `` `like-this` `` for file names, commands, class names, function names, environment variables.

## Links

- Internal links to other sections use GitHub-style anchors: `[ver sección 4](#4-diagrama-de-componentes)`.
- External links with absolute URLs only. Never bare URLs.

## Images and diagrams

- Diagrams are always fenced Mermaid blocks inside the Markdown. The build script renders them.
- Never embed pre-rendered images as base64 inline.
- If an image is strictly necessary (e.g. a logo), reference it by relative path: `![Logo](./assets/logo.png)`.

## Naming and capitalization

- Product names keep their official casing: Angular, Node.js, Spring Boot, PostgreSQL.
- Language names: TypeScript, JavaScript, Java, Python, Go, Rust.
- Framework method names in inline code: `` `ngOnInit()` ``, `` `@Autowired` ``.

## Length discipline

- A section that reads like it is padding is too long. Prefer fewer, denser sentences.
- Tables are almost always clearer than prose for lists of attributes.
- If a section is longer than two printed pages, split it into H3 subsections.

## Banned patterns

Never emit any of these in the final document:

- Emoji (✅ ❌ 🚀 💡 etc.)
- `TODO`, `TBD`, `FIXME`, `XXX`
- Placeholder class names like `ServiceA`, `ComponentB`, `YourClass`
- First person: "voy a explicar", "como vimos"
- Questions directed at the reader: "¿Alguna vez se preguntaron...?"
- Marketing language: "la mejor solución", "revolucionario"
- Phrases like "como se puede ver en el diagrama" — the diagram is literally next to the text

## Front matter (cover page)

Exactly this structure, filled with real values:

```markdown
# <Project Name>

> **Documentación General**
> Versión: <git-sha-o-tag>
> Fecha: <YYYY-MM-DD>
> Generado por: project-docs-generator skill

---
```

The horizontal rule after the metadata block forces the next section onto a clear visual break.

## Final-page appendix format

The `## 17. Apéndice — Evidencia` section uses H3 per technology and a bullet list per file. Example:

```markdown
## 17. Apéndice — Evidencia

### Angular
- angular.json
- package.json
- src/app/app.module.ts

### Node/Express
- package.json
- server.js
```
