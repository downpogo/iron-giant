import "dotenv/config"
import { Sandbox } from "./sandbox.js"

async function main() {
  const sandbox = new Sandbox()

  await sandbox.getOrCreate({
    id: "123",
    repositoryBranch: "main",
    repositoryURL: "https://github.com/downpogo/memento",
  })

  process.on("SIGINT", async () => {
    try {
      await sandbox.delete()
      console.error("sandbox deleted")
    } catch (err) {
      console.error("failed to delete sandbox", err)
    } finally {
      process.exit(0)
    }
  })
}

main().catch((err) => {
  console.error("coding agent execution failed", err)
  process.exit(1)
})
