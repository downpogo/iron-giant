import { drizzle } from "drizzle-orm/d1"

let db: ReturnType<typeof drizzle>

export function initDB(dbBinding: D1Database) {
  db = drizzle(dbBinding)
}

export function getDB() {
  if (!db) {
    throw new Error("DB is not initialized")
  }
  return db
}
