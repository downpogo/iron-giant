#!/usr/bin/env node

import { Command } from 'commander'

import { registerLoginCommand } from '@/cli/login.js'

const program = new Command()
  .name('iron-giant')
  .description('Run coding sessions in isolated sandboxes')
  .version('0.1.0')
  .showHelpAfterError()

registerLoginCommand(program)

await program.parseAsync()
