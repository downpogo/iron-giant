import type { Command } from 'commander'

import { login } from '@/app/login.js'
import { getConfig } from '@/config.js'
import {
  getCredentialsPath,
  InsecureFileCredentialStore,
  KeychainCredentialStore,
} from '@/credentials.js'
import { GitConnectionStore } from '@/db/git-connection-store.js'
import { openDB } from '@/db/database.js'
import { UserStore } from '@/db/user-store.js'
import { GitHubProvider } from '@/git/github.js'

export function registerLoginCommand(program: Command) {
  program
    .command('login')
    .description('Authenticate with GitHub')
    .option(
      '--insecure-storage',
      'store the access token as plaintext in the config directory',
    )
    .action(async ({ insecureStorage }: { insecureStorage?: boolean }) => {
      const config = getConfig()
      const database = openDB()

      try {
        const user = new UserStore(database.db).getOrCreateLocalUser()
        const credentials = insecureStorage
          ? new InsecureFileCredentialStore()
          : new KeychainCredentialStore()

        if (insecureStorage) {
          console.warn(
            `Warning: the GitHub token will be stored as plaintext at ${getCredentialsPath()}.`,
          )
        }

        const result = await login(
          {
            userId: user.id,
            provider: new GitHubProvider({
              clientId: config.GITHUB_OAUTH_CLIENT_ID,
            }),
            credentials,
            connections: new GitConnectionStore(database.db),
          },
          ({ userCode, verificationUri }) => {
            console.log(`Open ${verificationUri}`)
            console.log(`Enter code: ${userCode}`)
            console.log('Waiting for authorization...')
          },
        )

        console.log(`Authenticated as ${result.account.username}`)
      } finally {
        database.close()
      }
    })
}
