import { Link, Outlet, createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { orpc } from "@/lib/rpc/client"

export const Route = createFileRoute("/_repoLayout/repo/$repoID/task")({
  loader: ({ context, params }) => {
    const queryOpts = orpc.task.list.queryOptions({
      input: {
        repositoryID: params.repoID,
      },
    })
    return context.queryClient.ensureQueryData(queryOpts)
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { repoID } = Route.useParams()

  const queryOpts = orpc.task.list.queryOptions({
    input: {
      repositoryID: repoID,
    },
  })
  const { data: tasks } = useSuspenseQuery(
    orpc.task.list.queryOptions(queryOpts),
  )

  return (
    <div className="grid grid-cols-[30%_1fr] h-full">
      <div className="border-r p-4">
        <h1 className="text-xl font-bold mb-5">
          <Link to="/repo/$repoID/task" params={{ repoID }}>
            Tasks
          </Link>
        </h1>

        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <Link
              to="/repo/$repoID/task/$taskID"
              params={{ repoID, taskID: task.id }}
              key={task.id}
              className="flex flex-col gap-1 border rounded-md px-4 py-2"
            >
              <span>{task.name}</span>
              <span className="text-muted-foreground">{task.description}</span>
            </Link>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  )
}
