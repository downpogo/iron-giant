import { sql } from 'drizzle-orm'
import {
  foreignKey,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

const timestamp = (name: string) => integer(name, { mode: 'timestamp_ms' })

export const users = sqliteTable('users', {
  id: text().primaryKey(),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`(unixepoch('subsec') * 1000)`),
})

export const gitConnections = sqliteTable(
  'git_connections',
  {
    id: text().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    provider: text().notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    providerUsername: text('provider_username').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
  },
  (table) => [
    uniqueIndex('git_connections_user_provider_account_unique').on(
      table.userId,
      table.provider,
      table.providerAccountId,
    ),
  ],
)

export const repositories = sqliteTable(
  'repositories',
  {
    id: text().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    gitConnectionId: text('git_connection_id').notNull(),
    providerRepositoryId: text('provider_repository_id').notNull(),
    owner: text().notNull(),
    name: text().notNull(),
    cloneUrl: text('clone_url').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
  },
  (table) => [
    foreignKey({
      columns: [table.gitConnectionId, table.userId],
      foreignColumns: [gitConnections.id, gitConnections.userId],
      name: 'repositories_connection_owner_fk',
    }),
  ],
)

export const sessionStatuses = [
  'provisioning',
  'running',
  'stopping',
  'stopped',
  'expired',
  'failed',
] as const

export type SessionStatus = (typeof sessionStatuses)[number]

export const sessions = sqliteTable(
  'sessions',
  {
    id: text().primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id),
    repositoryId: text('repository_id').notNull(),
    status: text({ enum: sessionStatuses }).notNull(),
    sandboxProvider: text('sandbox_provider').notNull(),
    sandboxId: text('sandbox_id'),
    agentUrl: text('agent_url'),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
    expiresAt: timestamp('expires_at').notNull(),
    stoppedAt: timestamp('stopped_at'),
  },
  (table) => [
    foreignKey({
      columns: [table.repositoryId, table.userId],
      foreignColumns: [repositories.id, repositories.userId],
      name: 'sessions_repository_owner_fk',
    }),
  ],
)
