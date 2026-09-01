import assert from 'node:assert/strict'
import { test } from 'node:test'

import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'

import { GitConnectionStore } from './git-connection-store.js'
import * as schema from './schema.js'

test('Git connection store updates an existing provider account', () => {
  const sqlite = new Database(':memory:')
  sqlite.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY NOT NULL,
      created_at INTEGER DEFAULT (unixepoch('subsec') * 1000) NOT NULL
    );
    CREATE TABLE git_connections (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id),
      provider TEXT NOT NULL,
      provider_account_id TEXT NOT NULL,
      provider_username TEXT NOT NULL,
      created_at INTEGER DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
      UNIQUE(user_id, provider, provider_account_id)
    );
  `)
  const db = drizzle(sqlite, { schema })

  try {
    db.insert(schema.users).values({ id: 'user-1' }).run()
    const store = new GitConnectionStore(db)
    const connection = store.upsert({
      userId: 'user-1',
      provider: 'github',
      providerAccountId: '123',
      providerUsername: 'old-name',
    })
    const updatedConnection = store.upsert({
      userId: 'user-1',
      provider: 'github',
      providerAccountId: '123',
      providerUsername: 'new-name',
    })

    assert.match(connection.id, /^[0-9A-HJKMNP-TV-Z]{26}$/)
    assert.equal(updatedConnection.id, connection.id)
    assert.deepEqual(
      db
        .select({ username: schema.gitConnections.providerUsername })
        .from(schema.gitConnections)
        .all(),
      [{ username: 'new-name' }],
    )
  } finally {
    sqlite.close()
  }
})
