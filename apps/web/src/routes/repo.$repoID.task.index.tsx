import { Link, createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { RepoList } from "."
import { orpc } from "@/lib/rpc/client"

export const Route = createFileRoute("/repo/$repoID/task/")({
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

  const { data: repositories } = useSuspenseQuery(
    orpc.repository.list.queryOptions(),
  )

  const queryOpts = orpc.task.list.queryOptions({
    input: {
      repositoryID: repoID,
    },
  })
  const { data: tasks } = useSuspenseQuery(
    orpc.task.list.queryOptions(queryOpts),
  )

  return (
    <div className="grid grid-cols-[20%_30%_1fr] h-dvh">
      <RepoList repositories={repositories} />

      <div className="border-r p-4">
        <h1 className="text-xl font-bold mb-5">
          <Link to="/">Tasks</Link>
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

      <div className="flex items-center justify-center">
        <p className="text-muted-foreground">Select any task</p>
      </div>
    </div>
  )
}
