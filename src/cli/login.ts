import type { Command } from 'commander'

import { login } from '@/app/login.js'

export function registerLoginCommand(program: Command) {
  program
    .command('auth')
    .description('Manage Git provider authentication')
    .command('login')
    .description('Authenticate with GitHub')
    .action(() => {
      console.log(login())
    })
}
