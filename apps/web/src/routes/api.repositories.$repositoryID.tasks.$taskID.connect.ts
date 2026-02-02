import { createFileRoute } from "@tanstack/react-router"
import { env } from "cloudflare:workers"
import { getTask } from "@iron-giant/core/task"
import { getTaskDO } from "@iron-giant/core/do/agent-do"

export const Route = createFileRoute(
  "/api/repositories/$repositoryID/tasks/$taskID/connect",
)({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const upgradeHeader = request.headers.get("Upgrade")
        if (!upgradeHeader || upgradeHeader !== "websocket") {
          return new Response("Worker expected Upgrade: websocket", {
            status: 426,
          })
        }

        try {
          await getTask(params.repositoryID, params.taskID)
        } catch (_error) {
          return new Response("Task not found", { status: 404 })
        }

        const stub = getTaskDO(env, params.taskID)
        return stub.fetch(request)
      },
    },
  },
})
