import { createFileRoute } from "@tanstack/react-router"
import { handler } from "@/lib/orpc"

export const Route = createFileRoute("/api/$")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const { response } = await handler.handle(request, {
          prefix: "/api",
          context: {},
        })
        return response ?? new Response("Not Found", { status: 404 })
      },
    },
  },
})
