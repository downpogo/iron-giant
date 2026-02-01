import { Link, createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { Repository } from "@iron-giant/core/domain"
import { orpc } from "@/lib/rpc/client"

export const Route = createFileRoute("/")({
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
      <RepoList repositories={repositories} />
      <div className="flex items-center justify-center">
        <p className="text-muted-foreground">Select repository to view tasks</p>
      </div>
    </div>
  )
}

type RepoListProps = {
  repositories: Array<Repository>
}

export function RepoList(props: RepoListProps) {
  const { repositories } = props

  return (
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
            className="flex flex-col gap-1 border rounded-md px-4 py-2"
          >
            <span>{repo.name}</span>
            <span className="text-muted-foreground truncate">{repo.url}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
