module.exports = {
  "apps/web/**/*.{js,ts,tsx}": [
    "pnpm -C apps/web exec prettier --write",
    "pnpm -C apps/web exec eslint",
  ],
  "packages/core/**/*.{js,ts,tsx}": [
    "pnpm -C packages/core exec prettier --write",
    "pnpm -C packages/core exec eslint",
  ],
  "**/*.{json,md,css,html,yml,yaml}": ["pnpm exec prettier --write"],
}
