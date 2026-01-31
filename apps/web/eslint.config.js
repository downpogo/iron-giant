//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  {
    ignores: [".wrangler/**", "src/components/ui/**"],
  },
  ...tanstackConfig,
]
