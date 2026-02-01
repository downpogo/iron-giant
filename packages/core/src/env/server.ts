import "dotenv/config"
import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const serverEnv = createEnv({
  server: {
    E2B_API_KEY: z.string(),
  },

  runtimeEnv: process.env,

  emptyStringAsUndefined: true,
})
