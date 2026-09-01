import type { CredentialKey } from './login.js'

export type GitConnection = {
  id: string
  provider: string
  providerAccountId: string
  providerUsername: string
}

export type RepositoryMetadata = {
  providerRepositoryId: string
  owner: string
  name: string
  cloneUrl: string
}

export interface RepositoryProvider {
  readonly name: string
  getRepository(
    repositoryUrl: string,
    accessToken: string,
  ): Promise<RepositoryMetadata>
}

export interface RepositoryStore {
  upsert(
    input: RepositoryMetadata & {
      userId: string
      gitConnectionId: string
      provider: string
    },
  ): { id: string; owner: string; name: string }
}

export type RegisteredRepository = {
  id: string
  owner: string
  name: string
  account: string
}

export async function addRepository(input: {
  userId: string
  repositoryUrl: string
  account?: string
  connections: GitConnection[]
  getCredential(key: CredentialKey): Promise<{ secret: string } | undefined>
  provider: RepositoryProvider
  repositories: RepositoryStore
}) {
  const providerConnections = input.connections.filter(
    (connection) => connection.provider === input.provider.name,
  )
  const matchingConnections = input.account
    ? providerConnections.filter(
        (connection) =>
          connection.providerUsername.toLowerCase() ===
          input.account?.toLowerCase(),
      )
    : providerConnections

  if (matchingConnections.length === 0) {
    if (input.account) {
      throw new Error(`GitHub account ${input.account} is not connected`)
    }
    throw new Error(
      'No GitHub account is connected. Run iron-giant auth login first.',
    )
  }

  if (matchingConnections.length > 1) {
    throw new Error(
      'Multiple GitHub accounts are connected. Use --account <username>.',
    )
  }

  const connection = matchingConnections[0]
  if (!connection) {
    throw new Error('GitHub connection could not be selected')
  }

  const credential = await input.getCredential({
    provider: connection.provider,
    providerAccountId: connection.providerAccountId,
  })

  if (!credential) {
    throw new Error(
      `No token found for GitHub account ${connection.providerUsername}`,
    )
  }

  const repository = await input.provider.getRepository(
    input.repositoryUrl,
    credential.secret,
  )

  return input.repositories.upsert({
    ...repository,
    userId: input.userId,
    gitConnectionId: connection.id,
    provider: input.provider.name,
  })
}

export function listRepositories(input: {
  userId: string
  repositories: {
    list(userId: string): RegisteredRepository[]
  }
}) {
  return input.repositories.list(input.userId)
}
