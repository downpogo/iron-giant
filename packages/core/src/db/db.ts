import { drizzle } from "drizzle-orm/d1"

export function createDB(dbBinding: D1Database) {
  return drizzle(dbBinding)
}
