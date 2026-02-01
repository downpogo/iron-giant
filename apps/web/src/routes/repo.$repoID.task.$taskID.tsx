import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/repo/$repoID/task/$taskID")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/repo/$repoID/task/$taskID"!</div>
}
