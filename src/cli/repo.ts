import type { Command } from 'commander'

import { addRepository, listRepositories } from '@/app/repo.js'
import { getConfig } from '@/config.js'
import { StoredCredentialReader } from '@/credentials.js'
import { openDB } from '@/db/database.js'
import { GitConnectionStore } from '@/db/git-connection-store.js'
import { RepositoryStore } from '@/db/repository-store.js'
import { UserStore } from '@/db/user-store.js'
import { GitHubProvider } from '@/git/github.js'

export function registerRepoCommands(repo: Command) {
  repo
    .command('add')
    .description('Register a GitHub repository')
    .argument('<repository-url>', 'GitHub repository URL')
    .option(
      '--account <username>',
      'GitHub account used to access the repository',
    )
    .action(
      async (repositoryUrl: string, { account }: { account?: string }) => {
        const config = getConfig()
        const database = openDB()

        try {
          const user = new UserStore(database.db).getLocalUser()
          if (!user) {
            throw new Error('Not logged in. Run iron-giant auth login first.')
          }

          const credentials = new StoredCredentialReader()
          const repository = await addRepository({
            userId: user.id,
            repositoryUrl,
            ...(account ? { account } : {}),
            connections: new GitConnectionStore(database.db).list(user.id),
            getCredential: (key) => credentials.get(key),
            provider: new GitHubProvider({
              clientId: config.GITHUB_OAUTH_CLIENT_ID,
            }),
            repositories: new RepositoryStore(database.db),
          })

          console.log('Repository added')
          console.log(`ID: ${repository.id}`)
          console.log(`Repository: ${repository.owner}/${repository.name}`)
        } finally {
          database.close()
        }
      },
    )

  repo
    .command('list')
    .description('List registered repositories')
    .action(() => {
      const database = openDB()

      try {
        const user = new UserStore(database.db).getLocalUser()
        if (!user) {
          throw new Error('Not logged in. Run iron-giant auth login first.')
        }

        const repositories = listRepositories({
          userId: user.id,
          repositories: new RepositoryStore(database.db),
        })

        if (repositories.length === 0) {
          console.log(
            'No repositories registered. Run iron-giant repo add <repository-url>.',
          )
          return
        }

        const idWidth = Math.max(
          'ID'.length,
          ...repositories.map(({ id }) => id.length),
        )
        const repositoryNames = repositories.map(
          ({ owner, name }) => `${owner}/${name}`,
        )
        const repositoryWidth = Math.max(
          'REPOSITORY'.length,
          ...repositoryNames.map((name) => name.length),
        )

        console.log(
          `${'ID'.padEnd(idWidth)}  ${'REPOSITORY'.padEnd(repositoryWidth)}  ACCOUNT`,
        )
        repositories.forEach((repository, index) => {
          console.log(
            `${repository.id.padEnd(idWidth)}  ${repositoryNames[index]?.padEnd(repositoryWidth)}  ${repository.account}`,
          )
        })
      } finally {
        database.close()
      }
    })
}
