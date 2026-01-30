import config from "@iron-giant/config/eslint.config.js"

export default [
  ...config,
  {
    ignores: ["dist/**"],
  },
]
