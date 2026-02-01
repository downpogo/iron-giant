import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_repoLayout/repo/$repoID/task/$taskID")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">Task details</h2>
      <p className="text-muted-foreground">
        Select fields and actions to load for this task.
      </p>
    </div>
  )
}
