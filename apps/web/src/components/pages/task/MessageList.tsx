import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import type { CodingAgentMessage } from "@iron-giant/core/domain"
import { useTaskStore } from "@/lib/stores/task"

export function MessageList() {
  const messages = useTaskStore().messages

  return (
    <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-scroll">
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

  return message.parts.map((part) => {
    return (
      <div className="flex flex-col gap-0.5" key={part.data.id}>
        {part.name === "reasoning" && (
          <p className="text-primary font-bold">Reasoning</p>
        )}
        <Streamdown plugins={{ code }}>{part.data.text}</Streamdown>
      </div>
    )
  })
}
