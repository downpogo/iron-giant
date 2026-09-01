#!/usr/bin/env node

import { Command } from 'commander'

import { registerAuthStatusCommand } from '@/cli/auth-status.js'
import { registerLoginCommand } from '@/cli/login.js'

const program = new Command()
  .name('iron-giant')
  .description('Run coding sessions in isolated sandboxes')
  .version('0.1.0')
  .showHelpAfterError()

const auth = program
  .command('auth')
  .description('Manage Git provider authentication')

registerLoginCommand(auth)
registerAuthStatusCommand(auth)

try {
  await program.parseAsync()
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Unexpected error')
  process.exitCode = 1
}
