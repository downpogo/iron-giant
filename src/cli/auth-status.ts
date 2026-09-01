import type { Command } from 'commander'

import { getAuthStatus } from '@/app/auth-status.js'
import { getConfig } from '@/config.js'
import { StoredCredentialReader } from '@/credentials.js'
import { openDB } from '@/db/database.js'
import { GitConnectionStore } from '@/db/git-connection-store.js'
import { UserStore } from '@/db/user-store.js'
import { GitHubProvider } from '@/git/github.js'

export function registerAuthStatusCommand(auth: Command) {
  auth
    .command('status')
    .description('Show Git provider authentication status')
    .action(async () => {
      const config = getConfig()
      const database = openDB()

      try {
        const user = new UserStore(database.db).getLocalUser()

        if (!user) {
          console.log('Not logged in')
          process.exitCode = 1
          return
        }

        const connections = new GitConnectionStore(database.db).list(user.id)

        if (connections.length === 0) {
          console.log('Not logged in')
          process.exitCode = 1
          return
        }

        const credentials = new StoredCredentialReader()
        const github = new GitHubProvider({
          clientId: config.GITHUB_OAUTH_CLIENT_ID,
        })
        const statuses = await getAuthStatus({
          connections,
          getCredential: (key) => credentials.get(key),
          getProvider: (name) => (name === github.name ? github : undefined),
        })

        for (const status of statuses) {
          printStatus(status)
          if (status.status !== 'valid') {
            process.exitCode = 1
          }
        }
      } finally {
        database.close()
      }
    })
}

function printStatus(
  status: Awaited<ReturnType<typeof getAuthStatus>>[number],
) {
  console.log(
    status.connection.provider === 'github'
      ? 'github.com'
      : status.connection.provider,
  )

  switch (status.status) {
    case 'valid':
      console.log(`  Logged in as ${status.account.username}`)
      console.log(`  Account ID: ${status.account.id}`)
      console.log(`  Token storage: ${status.storage}`)
      break
    case 'invalid':
      console.log(`  Token is invalid: ${status.error}`)
      break
    case 'mismatch':
      console.log(
        `  Token belongs to ${status.account.username}, not ${status.connection.providerUsername}`,
      )
      break
    case 'missing':
      console.log(`  No token found for ${status.connection.providerUsername}`)
      break
    case 'unsupported':
      console.log('  Provider is not supported')
  }
}
