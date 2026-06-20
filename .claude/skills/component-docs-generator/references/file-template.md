# File Template — Per-File Subsection Structure

Every file in the generated document uses this exact template. Do not reorder the fields. Do not add fields. Do not remove fields.

## Canonical template

```markdown
### `<filename>`

**Path**: `<relative/path/from/repo/root>`
**Tipo**: <classification from enumerate_files.py>
**Propósito**: <1–2 sentences, extracted from code comments or inferred from clear naming>

#### Firma / API pública

<Code block or table showing the public surface of the file>

#### Dependencias

<Bulleted list of imports / injected services / extended classes>

#### Usado por

<Bulleted list of other files that reference this one, or "No determinado">

#### Notas

<Optional: annotations, TODOs found in-code, notable patterns, warnings>
```

## Field-by-field rules

### `<filename>` (H3)

Use the file basename without the path, wrapped in backticks. Example: `` ### `user.service.ts` ``. If two files in the document share the same basename, append a disambiguator in parentheses: `` ### `user.service.ts` (features/admin) ``.

### `**Path**`

Full relative path from the repo root, wrapped in backticks. Example: `` `src/app/features/cart/cart.component.ts` ``.

### `**Tipo**`

Copy the `type` field from `enumerate_files.py` output. Canonical values:

- `angular-component` — .ts with `@Component` decorator
- `angular-service` — .ts with `@Injectable` decorator
- `angular-directive` — .ts with `@Directive`
- `angular-pipe` — .ts with `@Pipe`
- `angular-guard` — .ts implementing `CanActivate` / `CanMatch`
- `angular-interceptor` — .ts implementing `HttpInterceptor`
- `angular-module` — .ts with `@NgModule`
- `angular-resolver` — .ts implementing `Resolve`
- `angular-template` — .html paired with a component
- `angular-style` — .scss/.css paired with a component
- `typescript-model` — .ts interface/type only (no decorators, no classes with behavior)
- `typescript-util` — .ts with exported functions only
- `java-controller` — .java with `@Controller` / `@RestController`
- `java-service` — .java with `@Service`
- `java-repository` — .java with `@Repository` or extending `JpaRepository`
- `java-entity` — .java with `@Entity` / `@Table`
- `java-dto` — .java class with only fields/getters (no business logic)
- `java-config` — .java with `@Configuration`
- `node-route` — .js/.ts Express/Fastify/Koa route file
- `node-middleware` — .js/.ts with `(req, res, next)` signature
- `python-view` — .py with FastAPI/Flask/Django view
- `python-model` — .py with SQLAlchemy/Django model
- `config-file` — package.json, tsconfig.json, angular.json, pom.xml, etc.
- `env-file` — .env*, application.properties
- `docker-file` — Dockerfile, docker-compose.yml
- `ci-file` — workflow YAML
- `sql-migration` — .sql migration
- `unknown` — classified but type not in list

### `**Propósito**`

Maximum 2 sentences. Extract from:
1. Top-of-file JSDoc / Javadoc block
2. Class-level JSDoc / Javadoc
3. Inferred from the file name if, and only if, the name is unambiguous (e.g. `auth-guard.ts`, `user-repository.java`)
4. Otherwise write: `Propósito no inferido automáticamente`

Never fabricate a purpose. Never use vague phrases like "handles business logic" or "contains code for the feature".

### `#### Firma / API pública`

Format depends on the file type:

**angular-component** — a fenced `typescript` code block with the decorator + class declaration. Include:
- `@Component({ selector, standalone, changeDetection, imports (max 5, truncate with "...") })`
- Class declaration line
- All `input()` / `output()` / `model()` signals OR `@Input()` / `@Output()` declarations
- All public methods: `methodName(params): returnType`

Example:
```markdown
#### Firma / API pública

\`\`\`typescript
@Component({
  selector: 'app-cart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, CartItemComponent, ...]
})
export class CartComponent {
  readonly items = input.required<CartItem[]>();
  readonly itemRemoved = output<string>();

  removeItem(id: string): void
  totalPrice(): number
}
\`\`\`
```

**angular-service** — fenced `typescript` block with the `@Injectable` config and all public methods with their signatures.

**angular-template** — a `markdown` table: `Directiva/binding | Propósito`. List `@if`, `@for`, `@switch` blocks, `(click)` handlers, `[property]` bindings referencing parent state, and child components used.

**angular-style** — a `markdown` table: `Clase / variable | Uso`. List top-level class selectors and CSS custom properties.

**java-controller** — a `markdown` table: `Método HTTP | Path | Handler | Request body | Response`. One row per endpoint.

**java-service** — fenced `java` block with the class declaration and public method signatures.

**java-entity / java-dto** — a `markdown` table: `Campo | Tipo | Validaciones | Descripción`.

**java-repository** — fenced `java` block with the interface declaration and all query methods.

**config-file / env-file** — a `markdown` table with the relevant keys. For `package.json`, show scripts and main deps. For `tsconfig.json`, show compiler options. For `application.properties`, show all non-default keys.

**docker-file** — a fenced `dockerfile` / `yaml` block showing the raw file if under 30 lines, otherwise a summary table of stages/services.

**unknown** — fenced code block with the first 20 lines of the file, plus a note: `Archivo no clasificado automáticamente — ver contenido`.

### `#### Dependencias`

Bulleted list. For TypeScript: one bullet per `import` statement, grouped by source (`@angular/*`, third-party, project-relative). For Java: one bullet per `import` line that is not `java.util.*` / `java.lang.*`.

If there are zero dependencies, write `Ninguna`.

### `#### Usado por`

Bulleted list of files that import, inject, or reference this file. Sources:
- Grep for the class name
- Grep for the file name (without extension) in import statements
- Angular: grep for the selector in templates

If you cannot determine usage (e.g. the file is only referenced by convention, like a main entrypoint), write `No determinado`.

Maximum 10 entries. If there are more, show the first 10 and write `... (+N más)`.

### `#### Notas`

Optional. Include only if there is something specific to say:
- `TODO`, `FIXME`, `XXX`, `HACK` comments found in the file
- Deprecated annotations (`@Deprecated`, `@deprecated` JSDoc)
- Files older than 1 year that may be stale (if you can determine this)
- Unusual patterns worth flagging (e.g. `any` types, disabled lint rules, hardcoded credentials)

If there is nothing to note, omit the `#### Notas` heading entirely (do not leave an empty section).

## Example — complete subsection

```markdown
### `cart.service.ts`

**Path**: `src/app/features/cart/cart.service.ts`
**Tipo**: angular-service
**Propósito**: Gestiona el estado del carrito de compras en memoria y sincroniza con el backend al checkout.

#### Firma / API pública

\`\`\`typescript
@Injectable({ providedIn: 'root' })
export class CartService {
  readonly items = signal<CartItem[]>([]);
  readonly total = computed(() => ...);

  addItem(item: CartItem): void
  removeItem(id: string): void
  clear(): void
  checkout(): Observable<Order>
}
\`\`\`

#### Dependencias

- `@angular/core` (inject, signal, computed, Injectable)
- `@angular/common/http` (HttpClient)
- `./models/cart-item.model`
- `../../core/auth/auth.service`

#### Usado por

- `src/app/features/cart/cart.component.ts`
- `src/app/features/checkout/checkout.component.ts`
- `src/app/shared/header/header.component.ts`

#### Notas

- TODO en línea 42: "persistir carrito en localStorage cuando el usuario se loguea"
- Usa `HttpClient` directo sin un repositorio intermedio; considerar refactor.
```

## Rendering budget per file

- Minimum useful subsection: 8 lines (Path + Tipo + Propósito + minimal Firma).
- Typical subsection: 20–40 lines.
- Maximum subsection: 80 lines. If a file needs more, it probably means the file is doing too much — document the public surface only and add a note.
