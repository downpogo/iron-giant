import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { orpc } from "@/lib/rpc/client"
import { Socket } from "@/lib/socket"

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
  const [message, setMessage] = useState("")

  const queryOpts = orpc.task.get.queryOptions({
    input: {
      taskID,
      repositoryID: repoID,
    },
  })

  const { data: task } = useSuspenseQuery(queryOpts)

  const socket = useMemo(
    () => new Socket({ repositoryID: repoID, taskID }),
    [repoID, taskID],
  )

  useEffect(() => {
    socket.init()

    return () => {
      socket.disconnect()
    }
  }, [socket])

  const handleSendMessage = () => {
    const trimmed = message.trim()
    if (!trimmed) {
      return
    }
    socket.send({ name: "SEND_MESSAGE", data: { message: trimmed } })
    setMessage("")
  }

  return (
    <div className="flex flex-col">
      <p className="p-4 font-bold py-3 border-b border-border">{task.name}</p>

      <div className="flex-1"></div>

      <div className="p-4">
        <Textarea
          className="h-[90px] resize-none"
          placeholder="How can I assist you today?"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" || event.shiftKey) {
              return
            }
            event.preventDefault()
            handleSendMessage()
          }}
        />
      </div>
    </div>
  )
}
