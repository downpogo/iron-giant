import { createFileRoute } from "@tanstack/react-router"
import { orpc } from "@/lib/rpc/client"

export const Route = createFileRoute("/")({
  component: App,
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(
      orpc.repository.list.queryOptions(),
    )
  },
})

function App() {
  return <div className="min-h-screen"></div>
}
