import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { fileURLToPath } from 'node:url'

import * as schema from './schema.js'

export function createDatabase(path: string) {
  const sqlite = new Database(path)
  sqlite.pragma('foreign_keys = ON')

  return {
    db: drizzle(sqlite, { schema }),
    close: () => sqlite.close(),
  }
}

export function migrateDatabase(
  database: ReturnType<typeof createDatabase>['db'],
) {
  migrate(database, {
    migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)),
  })
}
