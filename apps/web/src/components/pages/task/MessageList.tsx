import type { CodingAgentMessage } from "@iron-giant/core/domain"
import { useTaskStore } from "@/lib/stores/task"

export function MessageList() {
  const messages = useTaskStore().messages

  return (
    <div className="flex-1 flex flex-col gap-4 p-4  overflow-y-scroll">
      {messages.map((message) => {
        return <Message key={message.id} message={message} />
      })}
    </div>
  )
}

type MessageProps = {
  message: CodingAgentMessage
}

function Message(props: MessageProps) {
  const { message } = props

  return (
    <div key={message.id} className="flex-1 flex flex-col gap-4 py-2">
      {message.parts.map((part) => {
        return (
          <div
            className="flex flex-col gap-4 border border-border p-4 mx-4"
            key={part.name}
          >
            {part.name === "step-start" && <p>STARTED!!!</p>}

            {part.name === "reasoning" && (
              <div className="flex flex-col gap-0.5">
                <p>Reasoning</p>
                <p>{part.data.text}</p>
              </div>
            )}

            {part.name === "text" && <p>{part.data.text}</p>}

            {part.name === "step-finish" && <p>FINISHED!!!</p>}
          </div>
        )
      })}
    </div>
  )
}
