import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getAuthStatus } from './auth-status.js'

const connection = {
  id: 'connection-1',
  provider: 'github',
  providerAccountId: '123',
  providerUsername: 'octocat',
}

test('auth status validates the stored account', async () => {
  const statuses = await getAuthStatus({
    connections: [connection],
    getCredential: async () => ({
      secret: 'secret-token',
      storage: 'keychain',
    }),
    getProvider: () => ({
      getAuthenticatedAccount: async () => ({
        id: '123',
        username: 'octocat',
      }),
    }),
  })

  assert.deepEqual(statuses, [
    {
      account: { id: '123', username: 'octocat' },
      connection,
      status: 'valid',
      storage: 'keychain',
    },
  ])
})

test('auth status detects a token for another account', async () => {
  const [status] = await getAuthStatus({
    connections: [connection],
    getCredential: async () => ({
      secret: 'secret-token',
      storage: 'plaintext',
    }),
    getProvider: () => ({
      getAuthenticatedAccount: async () => ({
        id: '456',
        username: 'hubot',
      }),
    }),
  })

  assert.equal(status?.status, 'mismatch')
})
