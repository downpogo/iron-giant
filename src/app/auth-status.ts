import type { CredentialKey, GitAccount } from './login.js'

type GitConnection = {
  id: string
  provider: string
  providerAccountId: string
  providerUsername: string
}

type Credential = {
  secret: string
  storage: 'keychain' | 'plaintext'
}

type AccountProvider = {
  getAuthenticatedAccount(accessToken: string): Promise<GitAccount>
}

export async function getAuthStatus(input: {
  connections: GitConnection[]
  getCredential(key: CredentialKey): Promise<Credential | undefined>
  getProvider(name: string): AccountProvider | undefined
}) {
  return Promise.all(
    input.connections.map(async (connection) => {
      const credential = await input.getCredential({
        provider: connection.provider,
        providerAccountId: connection.providerAccountId,
      })

      if (!credential) {
        return { connection, status: 'missing' as const }
      }

      const provider = input.getProvider(connection.provider)
      if (!provider) {
        return { connection, status: 'unsupported' as const }
      }

      try {
        const account = await provider.getAuthenticatedAccount(
          credential.secret,
        )

        if (account.id !== connection.providerAccountId) {
          return {
            account,
            connection,
            status: 'mismatch' as const,
            storage: credential.storage,
          }
        }

        return {
          account,
          connection,
          status: 'valid' as const,
          storage: credential.storage,
        }
      } catch (error) {
        return {
          connection,
          error: error instanceof Error ? error.message : 'Unknown error',
          status: 'invalid' as const,
          storage: credential.storage,
        }
      }
    }),
  )
}
