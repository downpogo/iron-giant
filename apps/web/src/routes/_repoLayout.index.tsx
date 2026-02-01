import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_repoLayout/")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground">Select repository to view tasks</p>
    </div>
  )
}
