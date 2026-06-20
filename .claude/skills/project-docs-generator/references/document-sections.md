# Required Document Sections — Project Documentation

This file defines the exact structure of the document produced by `project-docs-generator`. Follow this order strictly. Omit a section only if there is zero evidence for it, and when you omit, log it in `## Secciones omitidas`.

## Cover page (H1 + metadata block)

Start the document with:

```markdown
# <Nombre del proyecto>

> **Documentación General**
> Versión: <git short-sha o tag más reciente>
> Fecha: <YYYY-MM-DD>
> Generado por: project-docs-generator skill
```

Extract the project name from (in order of preference):
1. `name` field in `package.json`
2. `artifactId` in `pom.xml`
3. `name` in `pyproject.toml`
4. The directory name of the repo root

---

## 1. Resumen ejecutivo

Two to four paragraphs. Must answer:
- What does this project do?
- What problem does it solve?
- Who is the target user?
- What is the value delivered?

Evidence sources: `README.md`, top-level comments in entrypoints, `package.json` `description` field, `pom.xml` `<description>` tag. Never invent.

## 2. Stack tecnológico

A single Markdown table with the columns `Capa | Tecnología | Versión | Rol`. Populate from `stack.json`. Include every detected entry under `frontend`, `backend`, `build_tools`, `package_managers`, `databases`, `containerization`, `ci_cd`. Do not list "evidence" files in this table — they go in the appendix.

## 3. Arquitectura de alto nivel

One Mermaid `flowchart TB` or `C4Context` diagram showing the major layers and how they talk to each other. Mandatory diagram. See `mermaid-patterns.md` → "Architecture overview".

Accompany the diagram with 3–6 bullets explaining:
- The entry point for user requests.
- Where business logic lives.
- Where persistence happens.
- Any cross-cutting concerns (auth, logging, caching).

## 4. Diagrama de componentes

One Mermaid `flowchart LR` or `graph TB` diagram showing the top-level components / modules / services. Each node must be a real module name from the repo (e.g. for Angular, one node per feature folder in `src/app/features/`; for Spring Boot, one node per package under `src/main/java/<group>/`).

If the repo has more than 20 top-level components, group them into subgraphs by domain.

## 5. Flujo principal de datos

One Mermaid `sequenceDiagram` showing the happy path of the most important user action. To decide what "most important" means:
- E-commerce / checkout → purchase flow
- API service → a typical request lifecycle (auth → validation → business → persistence → response)
- Frontend app → the main user journey (login → dashboard → primary action)

Participants must be real service/component names.

## 6. Integraciones externas

One Mermaid `flowchart` with the project as the central node and one arrow to each external dependency: third-party APIs, databases, message queues, auth providers, CDNs, analytics. Source: `repo.json.integrations.external_urls` and `stack.json`.

Follow the diagram with a table: `Sistema | Tipo | Protocolo | Dónde se usa (archivo) | Propósito`.

## 7. API / Endpoints públicos

A single table: `Método | Path | Handler (archivo:línea si se tiene) | Auth | Descripción`. Populate from `repo.json.routes`. Group rows by resource if there are more than 15 endpoints. If the project has zero detected routes, write "Este proyecto no expone una API HTTP pública" and omit the table — do not fake rows.

## 8. Modelo de datos

One Mermaid `erDiagram` (if the project uses a relational DB or has ORM entities) or `classDiagram` (if it uses document-oriented models or TypeScript interfaces). Include every detected entity with its fields and relationships. Source: search for `@Entity`, `@Table`, `class X extends Model`, Prisma `model`, TypeScript `interface` files under `**/models/**` or `**/*.model.ts`.

## 9. Variables de entorno

A table: `Variable | Tipo | Default | Requerida | Descripción`. Source: `.env.example`, `application.properties`, `environment.ts`. Mark `Requerida = ✓` if the variable has no default. Never invent defaults — if unknown, write `—`.

## 10. Manual de instalación y puesta en marcha

Numbered steps with exact commands. Every command must be copy-pasteable. Sub-sections in this order:

1. **Prerequisitos del sistema** — Node/Java/Python versions, databases needed, Docker, OS requirements.
2. **Clonar el repositorio** — the `git clone` command.
3. **Instalar dependencias** — the exact install command(s) from `package.json`, `pom.xml`, etc.
4. **Configurar variables de entorno** — copy `.env.example` → `.env` and list variables to fill.
5. **Levantar servicios auxiliares** — `docker-compose up -d` if applicable.
6. **Correr en modo desarrollo** — the exact script (e.g. `npm run dev`, `mvn spring-boot:run`).
7. **Correr tests** — `npm test`, `mvn test`, `pytest`.
8. **Build de producción** — `npm run build`, `mvn package`.
9. **Deploy** — if there is a `Dockerfile`, show `docker build` and `docker run`. If there is a Helm chart or a deploy script, mention it.

Every command must come from the actual scripts or configs of the repo. Never invent commands.

## 11. Estructura de carpetas

A fenced `text` block with the 2-level tree from `repo.json.tree`. After the tree, a short descriptive list of what each top-level folder contains (one line each). Example:

```
src/
├── app/               → Código de la aplicación Angular
├── assets/            → Imágenes y recursos estáticos
└── environments/      → Configuración por entorno
```

## 12. CI/CD

If `stack.json.ci_cd` is non-empty, write one paragraph per detected tool describing what triggers a build and what stages run, and include one Mermaid `flowchart LR` showing: `push/PR → lint → test → build → deploy`. Read the actual workflow files to get real stage names.

If no CI/CD is detected, omit the section.

## 13. Scripts y tareas automatizadas

List every script from `package.json.scripts`, every Maven/Gradle task that is non-standard, and every `Makefile` target. Present as a table: `Comando | Qué hace | Cuándo usarlo`.

## 14. Troubleshooting

Only include this section if the `README.md` or a `TROUBLESHOOTING.md` has troubleshooting info. Do not invent problems. If nothing is found, omit.

## 15. Glosario de términos del dominio

Extract domain terms from class names, folder names, and `README.md`. Present as `Término — Definición`. Minimum 5 terms; if you can't find at least 5 real terms, omit the section.

## 16. Ownership y contactos

Source: `CODEOWNERS`, `package.json.author`, `pom.xml.developers`, git log top committers (`git log --format='%an' | sort -u | head`). Never invent emails.

## 17. Apéndice — Evidencia

A bullet list of every entry in `stack.json.evidence`, grouped by detected technology. This makes the document auditable: a reader can verify every claim by opening the cited file.

Format:
```
### Angular
- angular.json
- package.json (dependency: @angular/core)

### Spring Boot
- pom.xml (dependency: spring-boot-starter-web)
```

---

## Secciones omitidas (auto-generada)

At the very end of the document, if any of sections 1–16 were omitted, list them here with a one-line reason. Example:

```markdown
## Secciones omitidas

- **12. CI/CD** — No se detectaron workflows en `.github/workflows/` ni `Jenkinsfile`.
- **14. Troubleshooting** — No se encontró información en README.md ni TROUBLESHOOTING.md.
```

If no sections were omitted, still include the heading with the text `Ninguna. Todas las secciones del índice obligatorio fueron generadas.`.
