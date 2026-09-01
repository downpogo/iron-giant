import assert from 'node:assert/strict'
import { test } from 'node:test'

import { addRepository, listRepositories } from './repo.js'

const connections = [
  {
    id: 'connection-1',
    provider: 'github',
    providerAccountId: '123',
    providerUsername: 'octocat',
  },
]

test('add repository uses the connected account and persists metadata', async () => {
  const savedRepositories: object[] = []
  const repository = await addRepository({
    userId: 'user-1',
    repositoryUrl: 'https://github.com/acme/api',
    connections,
    getCredential: async () => ({ secret: 'secret-token' }),
    provider: {
      name: 'github',
      getRepository: async () => ({
        providerRepositoryId: '456',
        owner: 'acme',
        name: 'api',
        cloneUrl: 'https://github.com/acme/api.git',
      }),
    },
    repositories: {
      upsert: (input) => {
        savedRepositories.push(input)
        return { id: 'repository-1', owner: input.owner, name: input.name }
      },
    },
  })

  assert.deepEqual(repository, {
    id: 'repository-1',
    owner: 'acme',
    name: 'api',
  })
  assert.deepEqual(savedRepositories, [
    {
      userId: 'user-1',
      gitConnectionId: 'connection-1',
      provider: 'github',
      providerRepositoryId: '456',
      owner: 'acme',
      name: 'api',
      cloneUrl: 'https://github.com/acme/api.git',
    },
  ])
})

test('add repository requires account selection when multiple accounts exist', async () => {
  await assert.rejects(
    addRepository({
      userId: 'user-1',
      repositoryUrl: 'https://github.com/acme/api',
      connections: [
        ...connections,
        {
          id: 'connection-2',
          provider: 'github',
          providerAccountId: '789',
          providerUsername: 'hubot',
        },
      ],
      getCredential: async () => ({ secret: 'secret-token' }),
      provider: {
        name: 'github',
        getRepository: async () => {
          throw new Error('should not be called')
        },
      },
      repositories: {
        upsert: () => {
          throw new Error('should not be called')
        },
      },
    }),
    /Use --account <username>/,
  )
})

test('list repositories reads repositories for the current user', () => {
  let requestedUserId: string | undefined
  const repositories = listRepositories({
    userId: 'user-1',
    repositories: {
      list: (userId) => {
        requestedUserId = userId
        return [
          {
            id: 'repository-1',
            owner: 'acme',
            name: 'api',
            account: 'octocat',
          },
        ]
      },
    },
  })

  assert.equal(requestedUserId, 'user-1')
  assert.equal(repositories[0]?.name, 'api')
})
