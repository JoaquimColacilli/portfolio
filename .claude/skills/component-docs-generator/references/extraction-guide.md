# Extraction Guide — How to Extract Metadata Per File Type

This guide tells you what to extract from each kind of file. Use `extract_metadata.py` first for speed; when it doesn't handle the file type or the result is empty, fall back to reading the file directly and applying the extraction rules below.

## Angular Component (.ts with `@Component`)

Extract from the file:

1. **Decorator metadata** — parse the `@Component({...})` object literal:
   - `selector`: string value
   - `standalone`: boolean
   - `changeDetection`: the identifier name (`ChangeDetectionStrategy.OnPush`, etc.)
   - `templateUrl` / `template` and `styleUrls` / `styles`
   - `imports`: array of identifiers (list up to 5, append `, ...` if more)
2. **Class declaration** line, including `extends` / `implements`.
3. **Inputs**:
   - Modern: `readonly foo = input<Type>(...)` or `input.required<Type>(...)`
   - Legacy: `@Input() foo: Type` or `@Input() foo!: Type`
4. **Outputs**:
   - Modern: `readonly fooChange = output<Type>()`
   - Legacy: `@Output() fooChange = new EventEmitter<Type>()`
5. **Signal queries** (Angular 17+): `viewChild`, `contentChild`, `viewChildren`, `contentChildren`
6. **Lifecycle hooks implemented**: `ngOnInit`, `ngOnChanges`, `ngOnDestroy`, `ngAfterViewInit`, `ngAfterContentInit`, `ngDoCheck`, `ngAfterViewChecked`, `ngAfterContentChecked`
7. **Injected services**:
   - Modern: `private readonly x = inject(XService)`
   - Legacy: `constructor(private x: XService)`
8. **Public methods**: any non-static method that is not `private` and not prefixed with `_`. Extract `name(params): returnType`.

Dependencies come from the `import` statements at the top of the file.

## Angular Service (.ts with `@Injectable`)

1. Decorator metadata: `providedIn` value.
2. Class declaration.
3. All public fields (including signals: `signal<T>()`, `computed()`, `readonly store = ...`).
4. Injected services (same patterns as component).
5. Public methods with signatures.

## Angular Directive (.ts with `@Directive`)

1. Decorator: `selector`, `standalone`, `hostDirectives`, `exportAs`.
2. Inputs and outputs (same rules as component).
3. Host bindings: `@HostBinding()`, `@HostListener()`.

## Angular Pipe (.ts with `@Pipe`)

1. Decorator: `name`, `standalone`, `pure`.
2. `transform(value, ...args)` method signature.

## Angular Guard (.ts implementing `CanActivate` / functional guard)

1. Class or function name.
2. Return type.
3. Injected services.
4. If it's a `canActivateFn` arrow function, extract the function signature and its logic in one line.

## Angular Module (.ts with `@NgModule`)

1. Decorator metadata:
   - `declarations`: truncated list
   - `imports`: truncated list
   - `providers`: truncated list
   - `exports`: truncated list
2. Class declaration.

Rule: if the project is fully standalone, document modules briefly but note that they may be legacy.

## Angular Template (.html)

1. Read the file (max 200 lines for extraction purposes).
2. Identify:
   - Top-level structural blocks: `@if`, `@for`, `@switch`, `@defer`
   - Child components used: any `<app-*>` or similar custom selectors
   - Event bindings: `(click)`, `(submit)`, `(keyup)`, etc. — list unique handlers
   - Property bindings to parent state: `[value]`, `[disabled]`, `[class]`, etc. — list the bound properties
   - Two-way bindings: `[(ngModel)]`, `[(value)]`
3. Template references: `#variableName`

Render as a table: `Directiva/binding | Propósito`.

## Angular Style (.scss/.css)

1. Top-level class selectors (`.host`, `.container`, etc.) — up to 15
2. CSS custom properties defined: `--color-primary: ...`
3. Imports: `@import` or `@use` lines
4. Any `:host` rules

Render as a table: `Selector / variable | Uso`.

## Java Controller (@Controller / @RestController)

1. Class-level `@RequestMapping` base path.
2. For each public method: `@GetMapping` / `@PostMapping` / etc., the path, the method name, the parameters (including `@RequestBody`, `@PathVariable`, `@RequestParam`, `@RequestHeader`), and the return type.
3. Render as a table: `Método HTTP | Path (relativo) | Path (absoluto) | Request body | Response | Nombre del método Java`.

## Java Service (@Service)

1. Class declaration with `extends`/`implements`.
2. All public methods: `name(params): returnType`, marked with `@Transactional` if applicable.
3. `@Autowired` or constructor-injected dependencies.

## Java Repository (@Repository / extends JpaRepository)

1. Interface declaration with the entity type.
2. Every method signature (Spring Data queries and `@Query` annotations).

## Java Entity (@Entity) / Java DTO

1. Class declaration.
2. All fields with their type, validation annotations (`@NotNull`, `@Size`, `@Email`, `@Min`, `@Max`, `@Pattern`), and JPA annotations (`@Id`, `@GeneratedValue`, `@Column`, `@OneToMany`, `@ManyToOne`, `@JoinColumn`).
3. Render as a table: `Campo | Tipo | Validaciones | JPA | Descripción (del javadoc)`.

## Java Config (@Configuration)

1. All `@Bean` methods with the bean type.
2. Any `@ConditionalOn*` annotations.
3. Any `@Value("${...}")` injections that reveal config keys.

## Node/Express route file

1. Every `app.METHOD(path, handler)` and `router.METHOD(path, handler)`.
2. Middleware chains: `app.use(middleware1, middleware2, handler)`.
3. Render as the same table format as Java controllers.

## Node middleware

1. Function name and signature `(req, res, next)`.
2. What the middleware reads from `req` / writes to `res`.
3. Whether it calls `next()` / `next(err)`.

## TypeScript model / interface / type

1. Full interface or type declaration (reproduce it as a code block, it IS the public surface).
2. Any JSDoc comments on fields.

## TypeScript util

1. All exported functions with signatures: `fn(params): returnType`.
2. Any default export.

## Config file — package.json

Extract:
- `name`, `version`, `description`, `main`, `type` (`module` / `commonjs`)
- `scripts`: all entries (this IS the public surface of the file)
- `dependencies` count, `devDependencies` count
- A few notable dependencies (framework + test runner)

Render `scripts` as a table: `Script | Comando`.

## Config file — tsconfig.json

Extract:
- `extends` (if any)
- `compilerOptions.target`, `.module`, `.moduleResolution`, `.strict`, `.paths`
- `include`, `exclude`
- `references` (project references)

## Config file — angular.json

Extract per project:
- `projectType` (application / library)
- `root`, `sourceRoot`
- `architect.build.builder` and key build options
- `architect.serve.options`
- `architect.test.builder`

## Config file — pom.xml

Extract:
- `<groupId>`, `<artifactId>`, `<version>`, `<packaging>`
- Parent project (if any)
- Top-level `<dependency>` entries (name + version)
- Notable `<plugin>` entries (name + version)
- `<properties>` values

## Docker — Dockerfile

If the file is ≤ 30 lines, embed it verbatim. Otherwise produce a table:
- `Stage | Base image | Purpose`
- List `COPY`, `RUN`, `CMD`, `ENTRYPOINT`, `EXPOSE`, `ENV`, `WORKDIR` highlights

## Docker — docker-compose.yml

Render one table per top-level section:
- **services**: `Servicio | Imagen | Puertos | Volúmenes | Depends on`
- **volumes**: `Nombre | Driver`
- **networks**: `Nombre | Driver`

## CI file — GitHub Actions workflow

Extract:
- Workflow `name`
- `on` triggers (events + branches)
- Each `job`: `name`, `runs-on`, `steps` count, main actions used (`actions/checkout`, `setup-node`, etc.)
- Environment variables and secrets referenced

## SQL migration

Extract:
- Up / down sections if present
- Tables created/altered/dropped
- Columns added/removed/changed
- Indexes, constraints, foreign keys

## Fallback for unknown file types

1. Classify as `unknown`.
2. Read first 20 lines.
3. Include them verbatim in a code block in the Firma section.
4. Write `Archivo no clasificado automáticamente — ver primeras 20 líneas` as the Propósito.

## Speed optimization tips

- Batch file reads: fire 10 reads in parallel using the Read tool, then synthesize all 10 subsections in one pass.
- Skip metadata that is clearly empty. If a class has no methods, don't leave an empty `#### Firma` section — fold it into Propósito as "Clase marker sin métodos".
- When a file has > 20 public methods, list the 20 most-public-looking (skip internal-sounding names) and add `... (+N más, ver archivo)`.
