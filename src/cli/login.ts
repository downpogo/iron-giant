import type { Command } from 'commander'

import { login } from '@/app/login.js'

export function registerLoginCommand(program: Command) {
  program
    .command('auth')
    .description('Manage Git provider authentication')
    .command('login')
    .description('Authenticate with GitHub')
    .action(async () => {
      const [{ config }, { GitHubProvider }] = await Promise.all([
        import('@/config.js'),
        import('@/git/github.js'),
      ])

      const result = await login(
        new GitHubProvider({ clientId: config.GITHUB_OAUTH_CLIENT_ID }),
        ({ userCode, verificationUri }) => {
          console.log(`Open ${verificationUri}`)
          console.log(`Enter code: ${userCode}`)
          console.log('Waiting for authorization...')
        },
      )

      console.log(`Authenticated as ${result.account.username}`)
    })
}
