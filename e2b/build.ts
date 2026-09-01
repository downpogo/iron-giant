import 'dotenv/config'

import { defaultBuildLogger, Template } from 'e2b'

import { template } from './template.js'

const templateName = 'iron-giant-opencode:v1'

if (!process.env.E2B_API_KEY?.trim()) {
  throw new Error('E2B_API_KEY is required to build the sandbox template')
}

await Template.build(template, templateName, {
  cpuCount: 1,
  memoryMB: 1024,
  onBuildLogs: defaultBuildLogger(),
})
