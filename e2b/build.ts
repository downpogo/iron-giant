import 'dotenv/config'

import { defaultBuildLogger, Template } from 'e2b'

import { template } from './template.js'

const templateName = 'iron-giant-opencode:v1'

if (!process.env.E2B_API_KEY?.trim()) {
  throw new Error('E2B_API_KEY is required to build the sandbox template')
}

const build = await Template.build(template, templateName, {
  cpuCount: 2,
  memoryMB: 4096,
  onBuildLogs: defaultBuildLogger(),
})

console.log(build)
