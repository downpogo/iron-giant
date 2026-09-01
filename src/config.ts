import { createEnv } from '@t3-oss/env-core'
import { config as loadEnv } from 'dotenv'
import { z } from 'zod'

loadEnv({ quiet: true })

export function getConfig() {
  return createEnv({
    server: {
      GITHUB_OAUTH_CLIENT_ID: z.string().trim().min(1),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
  })
}
