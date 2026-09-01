import { defineConfig } from 'drizzle-kit'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

import { getDBPath } from './src/db/path.ts'

const databasePath = getDBPath()
mkdirSync(dirname(databasePath), { recursive: true })

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: databasePath,
  },
})
