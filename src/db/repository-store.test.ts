import assert from 'node:assert/strict'
import { test } from 'node:test'

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import { RepositoryStore } from './repository-store.js'
import * as schema from './schema.js'

test('repository store updates a repository added through another connection', () => {
  const sqlite = new Database(':memory:')
  sqlite.exec(`
    CREATE TABLE users (id TEXT PRIMARY KEY NOT NULL, created_at INTEGER NOT NULL);
    CREATE TABLE git_connections (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      provider_username TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE repositories (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      git_connection_id TEXT NOT NULL,
      provider_repository_id TEXT NOT NULL,
      owner TEXT NOT NULL,
      name TEXT NOT NULL,
      clone_url TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch('subsec') * 1000) NOT NULL
    );
  `)
  const db = drizzle(sqlite, { schema })

  try {
    db.insert(schema.users)
      .values({ id: 'user-1', createdAt: new Date() })
      .run()
    db.insert(schema.gitConnections)
      .values([
        {
          id: 'connection-1',
          userId: 'user-1',
          provider: 'github',
          providerAccountId: '123',
          providerUsername: 'octocat',
        },
        {
          id: 'connection-2',
          userId: 'user-1',
          provider: 'github',
          providerAccountId: '789',
          providerUsername: 'hubot',
        },
      ])
      .run()
    const store = new RepositoryStore(db)
    const input = {
      userId: 'user-1',
      gitConnectionId: 'connection-1',
      provider: 'github',
      providerRepositoryId: '456',
      owner: 'acme',
      name: 'api',
      cloneUrl: 'https://github.com/acme/api.git',
    }
    const repository = store.upsert(input)
    const updatedRepository = store.upsert({
      ...input,
      gitConnectionId: 'connection-2',
    })

    assert.equal(updatedRepository.id, repository.id)
    assert.equal(db.select().from(schema.repositories).all().length, 1)
    assert.equal(
      db.select().from(schema.repositories).get()?.gitConnectionId,
      'connection-2',
    )
    assert.deepEqual(store.list('user-1'), [
      {
        id: repository.id,
        owner: 'acme',
        name: 'api',
        account: 'hubot',
      },
    ])
  } finally {
    sqlite.close()
  }
})
