# Mermaid Patterns — Project Documentation

Reference templates for every Mermaid diagram used by `project-docs-generator`. Copy a template, replace the placeholder nodes with real names from the repo, and commit. Never leave placeholder node names in the final document.

All diagrams are declared inside fenced blocks with the `mermaid` language tag. The build script extracts them, renders them to SVG via `mmdc`, and embeds them as images in the PDF.

---

## Architecture overview (section 3)

**When to use**: System has clearly separated layers (UI / BFF / backend / DB).

### Template A — `flowchart TB` with subgraphs

```mermaid
flowchart TB
    subgraph Client["Cliente"]
        Browser["Navegador / Mobile"]
    end

    subgraph Frontend["Frontend — <real-framework>"]
        UI["UI Layer"]
        State["State Management"]
        HTTP["HTTP Client"]
    end

    subgraph Backend["Backend — <real-framework>"]
        Gateway["API Gateway / Controllers"]
        Services["Services / Business Logic"]
        Repo["Repositories / DAOs"]
    end

    subgraph Data["Data Layer"]
        DB[("<real-db-name>")]
        Cache[("Cache")]
    end

    subgraph External["Integraciones externas"]
        Ext1["<real-api-1>"]
        Ext2["<real-api-2>"]
    end

    Browser --> UI
    UI --> State
    State --> HTTP
    HTTP --> Gateway
    Gateway --> Services
    Services --> Repo
    Repo --> DB
    Services --> Cache
    Services --> Ext1
    Services --> Ext2
```

### Template B — `C4Context` (preferred for microservices)

```mermaid
C4Context
    title Contexto del sistema — <nombre-real>

    Person(user, "Usuario", "Descripción real del usuario")
    System(system, "<nombre-real>", "Descripción real del sistema")
    System_Ext(ext1, "<servicio-externo-1>", "Para qué se usa")
    System_Ext(ext2, "<servicio-externo-2>", "Para qué se usa")
    SystemDb_Ext(db, "<base-de-datos>", "Qué guarda")

    Rel(user, system, "Usa", "HTTPS")
    Rel(system, ext1, "Consume", "HTTPS/REST")
    Rel(system, ext2, "Envía eventos", "AMQP")
    Rel(system, db, "Lee/escribe", "JDBC")
```

---

## Components diagram (section 4)

**When to use**: Always.

### Template — `flowchart LR` with feature subgraphs

```mermaid
flowchart LR
    subgraph Core["Core"]
        Auth["<auth-module-real>"]
        Shared["<shared-module-real>"]
    end

    subgraph Features["Features"]
        F1["<feature-1-real>"]
        F2["<feature-2-real>"]
        F3["<feature-3-real>"]
    end

    subgraph Infra["Infrastructure"]
        Http["<http-client-real>"]
        Store["<state-store-real>"]
    end

    F1 --> Shared
    F2 --> Shared
    F3 --> Shared
    F1 --> Auth
    F2 --> Auth
    F3 --> Auth
    F1 --> Http
    F2 --> Http
    F3 --> Http
    F1 --> Store
    F2 --> Store
```

Rule: if the repo has > 20 top-level components, create one subgraph per domain area and limit to max 8 nodes per subgraph.

---

## Main data flow (section 5)

**When to use**: Always.

### Template — `sequenceDiagram`

```mermaid
sequenceDiagram
    autonumber
    actor User as Usuario
    participant FE as "<frontend-component-real>"
    participant BFF as "<bff-or-gateway-real>"
    participant SVC as "<service-real>"
    participant DB as "<database-real>"
    participant EXT as "<external-api-real>"

    User->>FE: <acción real del usuario>
    FE->>BFF: POST /api/<ruta-real>
    BFF->>BFF: Validar request
    BFF->>SVC: <método-de-servicio-real>()
    SVC->>DB: SELECT / INSERT
    DB-->>SVC: datos
    SVC->>EXT: HTTPS request
    EXT-->>SVC: respuesta
    SVC-->>BFF: resultado
    BFF-->>FE: 200 OK + JSON
    FE-->>User: Actualiza UI
```

Rule: every `participant` name must be an actual class/component/service name from the repo.

---

## External integrations (section 6)

### Template — `flowchart` with project as hub

```mermaid
flowchart LR
    subgraph Project["<nombre-real-del-proyecto>"]
        Core["Backend Core"]
    end

    DB[("<db-real>")]
    Cache[("<cache-real>")]
    Queue[["<queue-real>"]]
    Auth[/"<auth-provider-real>"/]
    API1["<api-externa-1-real>"]
    API2["<api-externa-2-real>"]
    Mail["<mail-provider-real>"]

    Core <--> DB
    Core <--> Cache
    Core --> Queue
    Core --> Auth
    Core --> API1
    Core --> API2
    Core --> Mail
```

Shape conventions:
- `[("...")]` = database
- `[["..."]]` = queue / message broker
- `[/".../]` = auth provider or external identity
- `["..."]` = REST API or generic external service

---

## Data model (section 8)

### Template A — `erDiagram` (for relational / ORM entities)

```mermaid
erDiagram
    USER {
        uuid id PK
        string email UK
        string name
        timestamp created_at
    }
    ORDER {
        uuid id PK
        uuid user_id FK
        decimal total
        string status
        timestamp created_at
    }
    ORDER_ITEM {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
    }
    PRODUCT {
        uuid id PK
        string sku UK
        string name
        decimal price
    }

    USER ||--o{ ORDER : places
    ORDER ||--|{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "is ordered as"
```

Replace every entity and field with real ones found in `*.entity.java`, Prisma schema, TypeORM entities, or `*.model.ts` files.

### Template B — `classDiagram` (for TS interfaces / document models)

```mermaid
classDiagram
    class <EntityRealName1> {
        +string id
        +string field1
        +Date createdAt
        +<method-real-name>()
    }
    class <EntityRealName2> {
        +string id
        +<EntityRealName1> parent
    }
    <EntityRealName1> <|-- <EntityRealName2>
```

---

## CI/CD flow (section 12)

### Template — `flowchart LR`

```mermaid
flowchart LR
    Trigger["push / PR a <rama-real>"] --> Install["Install deps"]
    Install --> Lint["<lint-command-real>"]
    Lint --> Test["<test-command-real>"]
    Test --> Build["<build-command-real>"]
    Build --> Deploy{"¿es rama main?"}
    Deploy -- Sí --> Prod["Deploy a <env-real>"]
    Deploy -- No --> End["Fin"]
```

Read the actual workflow YAML to use real stage names and commands.

---

## Size and splitting rules

- Never let a single diagram exceed 25 nodes.
- If the natural diagram has > 25 nodes, split by domain into 2–3 diagrams with clear titles.
- Every edge must represent a real dependency or call that you can point to a file for.
- If two nodes look like they should be connected but you cannot verify it from the code, leave them disconnected — do not guess.

## Validation tips

Before emitting a diagram, mentally verify:
1. Every arrow `-->` has matching source and target node IDs.
2. Every `subgraph` has a closing `end`.
3. Node labels with spaces or special characters are wrapped in `"..."`.
4. Sequence diagram participant names with special characters are wrapped in `"..."`.
5. No two nodes share the same ID (use suffixes if needed: `db_primary`, `db_replica`).
