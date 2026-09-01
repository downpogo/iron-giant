# Architecture Notes

## Product

The first MVP is a CLI built with TypeScript and the latest stable Node.js.

Users can register Git repositories, including private GitHub repositories, and create short-lived coding sessions for them. A session provisions an isolated sandbox, clones the selected repository, installs and starts OpenCode in that repository, and returns an OpenCode URL to the user.

Sandboxes typically live for one to two hours.

```text
User
  -> Repository
    -> Session
      -> Sandbox
        -> OpenCode agent
```

## Session Lifecycle

```text
Create session
  -> provision sandbox from the published template
  -> inject narrowly scoped Git credentials
  -> clone repository
  -> configure OpenCode
  -> start OpenCode server
  -> expose and return its URL
  -> destroy sandbox when stopped or expired
```

The MVP uses the E2B template `iron-giant-opencode:v1`
(`zmc49ttgp61vpq61vub2`). It provides 2 vCPUs, 4 GiB RAM, Node.js 24.14.0,
Git, and OpenCode 1.18.25. Its definition is maintained under `e2b/`, built
explicitly with `pnpm sandbox:build`, and consumed at runtime through
`E2B_TEMPLATE`.

## Provider Boundaries

The application must not depend directly on a particular Git host, sandbox provider, or coding agent implementation.

```text
GitProvider
  -> GitHubProvider (MVP)
  -> GitLabProvider (future)
  -> Other providers (future)

SandboxProvider
  -> E2BProvider
  -> DaytonaProvider
  -> Other providers (future)

CodingAgent
  -> OpenCodeAgent (MVP)
```

The session orchestrator coordinates these providers. We will initially implement only the providers selected for the MVP, while keeping their application-facing interfaces provider-neutral.

## CLI

The initial command shape is:

```bash
app auth login
app repo add <repository-url>
app repo list
app session create <repo-id>
app session list
app session stop <session-id>
```

Creating a session returns its ID, repository, expiry, and OpenCode URL.

## Users and Git Authentication

The person running the CLI is the implicit user for the local MVP. On first use, the CLI creates a local profile with a generated user ID.

`app auth login` authenticates with GitHub, preferably through GitHub's device flow. Git credentials must be stored in the operating system keychain, not in the application database or a normal configuration file.

An application user and a Git provider connection are separate concepts. This allows one user to connect multiple accounts and providers later.

```text
User
  -> GitConnections
  -> Repositories
  -> Sessions
```

Repositories and sessions belong to the application user. A repository also references the Git connection used to access it.

When a hosted backend is introduced, the CLI can authenticate against that service and the same user boundary can represent a remote account.

## Persistence

Use SQLite for the local CLI MVP. It requires no database server and is sufficient for a single local user managing repository and session metadata.

Use Drizzle ORM for the schema, queries, and migrations. Keep database access behind small domain-oriented store interfaces, such as `UserStore`, `RepositoryStore`, and `SessionStore`.

```text
CLI
  -> Application services
    -> UserStore
    -> RepositoryStore
    -> SessionStore
      -> SQLite implementations
```

Drizzle queries and SQLite-specific behavior must remain inside the persistence module. A future Postgres implementation can replace the stores without changing session orchestration. This boundary contains the migration work, but does not assume SQLite and Postgres are configuration-level substitutes; their migrations and concurrency semantics differ.

Store the SQLite database in the operating system's standard per-user application-data directory.

Do not store secrets in SQLite. GitHub tokens, sandbox provider API keys, and OpenCode credentials belong in the OS keychain or environment variables. The database may store references to keychain entries.

## When to Move to Postgres

Adopt Postgres when the application gains a hosted control plane with multiple concurrent users, multiple API or worker processes, shared remote session state, background jobs, or distributed concurrency and locking requirements.

If the hosted backend becomes part of the immediate MVP, use Postgres from that point rather than extending the local SQLite model into a shared service.
