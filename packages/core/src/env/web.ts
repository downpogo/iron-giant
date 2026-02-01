import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const webEnv = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_WEB_URL: z.url(),
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runtimeEnv: (import.meta as any).env,
  emptyStringAsUndefined: true,
})
