import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, isAbsolute, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import * as schema from './schema.js'

export function getDBPath() {
  const dataRoot =
    process.env.XDG_DATA_HOME && isAbsolute(process.env.XDG_DATA_HOME)
      ? process.env.XDG_DATA_HOME
      : join(homedir(), '.local', 'share')

  return join(dataRoot, 'iron-giant', 'db.sqlite')
}

export function openDB() {
  const path = getDBPath()
  mkdirSync(dirname(path), { recursive: true })

  const sqlite = new Database(path)
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle(sqlite, { schema })

  try {
    migrate(db, {
      migrationsFolder: fileURLToPath(
        new URL('../../drizzle', import.meta.url),
      ),
    })

    return {
      db,
      close: () => sqlite.close(),
    }
  } catch (error) {
    sqlite.close()
    throw error
  }
}
