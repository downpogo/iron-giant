import { Link, Outlet, createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { RepoList } from "@/components/RepoList"
import { orpc } from "@/lib/rpc/client"

export const Route = createFileRoute("/_repoLayout")({
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(
      orpc.repository.list.queryOptions(),
    )
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { data: repositories } = useSuspenseQuery(
    orpc.repository.list.queryOptions(),
  )

  return (
    <div className="grid grid-cols-[20%_1fr] h-dvh">
      <div className="border-r p-4">
        <h1 className="text-xl font-bold mb-5">
          <Link to="/">Repositories</Link>
        </h1>

        <div className="flex flex-col gap-3">
          {repositories.map((repo) => (
            <Link
              to="/repo/$repoID/task"
              params={{ repoID: repo.id }}
              key={repo.id}
              className="flex flex-col gap-1 border rounded-md px-4 py-2 data-[status=active]:bg-primary/10 data-[status=active]:ring-ring data-[status=active]:ring-1"
            >
              <span>{repo.name}</span>
              <span className="text-muted-foreground truncate">{repo.url}</span>
            </Link>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  )
}
