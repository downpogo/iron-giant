module.exports = {
  "**/*.{js,ts,tsx}": ["pnpm run format", "pnpm run lint --"],
  "**/*.{json,md,css,html,yml,yaml}": ["pnpm run format"],
}
