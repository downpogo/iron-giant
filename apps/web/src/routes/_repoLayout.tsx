import { Outlet, createFileRoute } from "@tanstack/react-router"
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
      <RepoList repositories={repositories} />
      <Outlet />
    </div>
  )
}
