import { and, desc, eq } from 'drizzle-orm'
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'

import type { RepositoryStore as RepositoryStorePort } from '@/app/repo.js'
import { generateID } from '@/id.js'
import * as schema from './schema.js'

export class RepositoryStore implements RepositoryStorePort {
  constructor(private readonly db: BetterSQLite3Database<typeof schema>) {}

  list(userId: string) {
    return this.db
      .select({
        id: schema.repositories.id,
        owner: schema.repositories.owner,
        name: schema.repositories.name,
        account: schema.gitConnections.providerUsername,
      })
      .from(schema.repositories)
      .innerJoin(
        schema.gitConnections,
        eq(schema.repositories.gitConnectionId, schema.gitConnections.id),
      )
      .where(eq(schema.repositories.userId, userId))
      .orderBy(desc(schema.repositories.createdAt))
      .all()
  }

  upsert(input: {
    userId: string
    gitConnectionId: string
    provider: string
    providerRepositoryId: string
    owner: string
    name: string
    cloneUrl: string
  }) {
    const existingRepository = this.db
      .select({ id: schema.repositories.id })
      .from(schema.repositories)
      .innerJoin(
        schema.gitConnections,
        eq(schema.repositories.gitConnectionId, schema.gitConnections.id),
      )
      .where(
        and(
          eq(schema.repositories.userId, input.userId),
          eq(schema.gitConnections.provider, input.provider),
          eq(
            schema.repositories.providerRepositoryId,
            input.providerRepositoryId,
          ),
        ),
      )
      .get()

    const values = {
      userId: input.userId,
      gitConnectionId: input.gitConnectionId,
      providerRepositoryId: input.providerRepositoryId,
      owner: input.owner,
      name: input.name,
      cloneUrl: input.cloneUrl,
    }

    if (existingRepository) {
      return this.db
        .update(schema.repositories)
        .set(values)
        .where(eq(schema.repositories.id, existingRepository.id))
        .returning({
          id: schema.repositories.id,
          owner: schema.repositories.owner,
          name: schema.repositories.name,
        })
        .get()
    }

    return this.db
      .insert(schema.repositories)
      .values({ id: generateID(), ...values })
      .returning({
        id: schema.repositories.id,
        owner: schema.repositories.owner,
        name: schema.repositories.name,
      })
      .get()
  }
}
