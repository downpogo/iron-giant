import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

import { generateID } from '@/id.js'
import * as schema from './schema.js'

export class UserStore {
  constructor(private readonly db: BetterSQLite3Database<typeof schema>) {}

  getOrCreateLocalUser() {
    const existingUser = this.db.select().from(schema.users).get()

    if (existingUser) {
      return existingUser
    }

    return this.db
      .insert(schema.users)
      .values({ id: generateID() })
      .returning()
      .get()
  }
}
