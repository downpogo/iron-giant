import { and, eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

import type { GitConnectionStore as GitConnectionStorePort } from '@/app/login.js'
import { generateID } from '@/id.js'
import * as schema from './schema.js'

export class GitConnectionStore implements GitConnectionStorePort {
  constructor(private readonly db: BetterSQLite3Database<typeof schema>) {}

  list(userId: string) {
    return this.db
      .select()
      .from(schema.gitConnections)
      .where(eq(schema.gitConnections.userId, userId))
      .all()
  }

  upsert(input: {
    userId: string
    provider: string
    providerAccountId: string
    providerUsername: string
  }) {
    const existingConnection = this.db
      .select({ id: schema.gitConnections.id })
      .from(schema.gitConnections)
      .where(
        and(
          eq(schema.gitConnections.userId, input.userId),
          eq(schema.gitConnections.provider, input.provider),
          eq(schema.gitConnections.providerAccountId, input.providerAccountId),
        ),
      )
      .get()

    if (existingConnection) {
      this.db
        .update(schema.gitConnections)
        .set({
          providerUsername: input.providerUsername,
          updatedAt: new Date(),
        })
        .where(eq(schema.gitConnections.id, existingConnection.id))
        .run()

      return existingConnection
    }

    return this.db
      .insert(schema.gitConnections)
      .values({ id: generateID(), ...input })
      .returning({ id: schema.gitConnections.id })
      .get()
  }
}
