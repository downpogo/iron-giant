import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

import { getDBPath } from './path.js'
import * as schema from './schema.js'

export { getDBPath } from './path.js'

export function openDB() {
  const path = getDBPath()
  mkdirSync(dirname(path), { recursive: true })

  const sqlite = new Database(path)
  sqlite.pragma('foreign_keys = ON')

  const db = drizzle(sqlite, { schema })

  return {
    db,
    close: () => sqlite.close(),
  }
}
