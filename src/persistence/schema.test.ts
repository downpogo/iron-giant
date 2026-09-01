import assert from 'node:assert/strict'
import { test } from 'node:test'

import { eq } from 'drizzle-orm'

import { createDatabase, migrateDatabase } from './database.js'
import { gitConnections, repositories, sessions, users } from './schema.js'

function setup() {
  const database = createDatabase(':memory:')
  migrateDatabase(database.db)

  return database
}

test('ownership cannot cross user boundaries', () => {
  const database = setup()

  try {
    database.db
      .insert(users)
      .values([{ id: 'user-1' }, { id: 'user-2' }])
      .run()
    database.db
      .insert(gitConnections)
      .values({
        id: 'connection-1',
        userId: 'user-1',
        provider: 'github',
        providerAccountId: 'account-1',
        providerUsername: 'personal',
      })
      .run()

    assert.throws(() =>
      database.db
        .insert(repositories)
        .values({
          id: 'repository-1',
          userId: 'user-2',
          gitConnectionId: 'connection-1',
          providerRepositoryId: '123',
          owner: 'acme',
          name: 'api',
          cloneUrl: 'https://github.com/acme/api.git',
        })
        .run(),
    )
  } finally {
    database.close()
  }
})

test('session status is constrained', () => {
  const database = setup()

  try {
    database.db.insert(users).values({ id: 'user-1' }).run()
    database.db
      .insert(gitConnections)
      .values({
        id: 'connection-1',
        userId: 'user-1',
        provider: 'github',
        providerAccountId: 'account-1',
        providerUsername: 'personal',
      })
      .run()
    database.db
      .insert(repositories)
      .values({
        id: 'repository-1',
        userId: 'user-1',
        gitConnectionId: 'connection-1',
        providerRepositoryId: '123',
        owner: 'acme',
        name: 'api',
        cloneUrl: 'https://github.com/acme/api.git',
      })
      .run()

    assert.throws(() =>
      database.db
        .insert(sessions)
        .values({
          id: 'session-1',
          userId: 'user-1',
          repositoryId: 'repository-1',
          status: 'unknown' as 'running',
          sandboxProvider: 'e2b',
          expiresAt: new Date(Date.now() + 60_000),
        })
        .run(),
    )

    assert.equal(
      database.db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, 'user-1'))
        .all().length,
      0,
    )
  } finally {
    database.close()
  }
})
