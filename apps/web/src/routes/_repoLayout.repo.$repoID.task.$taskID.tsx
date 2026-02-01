import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Textarea } from "@/components/ui/textarea"
import { orpc } from "@/lib/rpc/client"

export const Route = createFileRoute("/_repoLayout/repo/$repoID/task/$taskID")({
  loader: ({ context, params }) => {
    const queryOpts = orpc.task.get.queryOptions({
      input: {
        taskID: params.taskID,
        repositoryID: params.repoID,
      },
    })

    return context.queryClient.ensureQueryData(queryOpts)
  },

  component: RouteComponent,
})

function RouteComponent() {
  const { repoID, taskID } = Route.useParams()

  const queryOpts = orpc.task.get.queryOptions({
    input: {
      taskID,
      repositoryID: repoID,
    },
  })

  const { data: task } = useSuspenseQuery(queryOpts)

  return (
    <div className="flex flex-col">
      <p className="p-4 font-bold py-3 border-b border-border">{task.name}</p>

      <div className="flex-1"></div>

      <div className="p-4">
        <Textarea
          className="h-[90px] resize-none"
          placeholder="How can I assist you today?"
        />
      </div>
    </div>
  )
}
