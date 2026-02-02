import { OpencodeClient, type Session } from "@opencode-ai/sdk/v2"
import { createOpencodeClient } from "@opencode-ai/sdk/v2"
import type { TaskDTO } from "./dto"
import type { OnEvent, AppEvent } from "./event.js"

export class CodingAgent {
  oc!: OpencodeClient
  sessionID!: string
  onEvent!: (event: AppEvent) => void

  async getOrCreateSession(
    task: TaskDTO,
    url: string,
    onEvent?: OnEvent,
  ): Promise<string> {
    this.oc = createOpencodeClient({ baseUrl: url })
    this.subscribe()
    this.onEvent = onEvent ? onEvent : () => {}

    let session = await this.getSession(task.id)
    if (!session) {
      this.onEvent({
        name: "CREATING_SESSION",
      })
      session = await this.createSession(task)
    }

    this.sessionID = session.id
    return this.sessionID
  }

  async sendMessage(message: string) {
    const result = await this.oc.session.prompt({
      sessionID: this.sessionID,
      model: {
        providerID: "opencode",
        modelID: "kimi-k2.5-free",
      },
      parts: [{ type: "text", text: message }],
    })

    if (result.error) {
      console.error("failed to send message:", result.error)
      return
    }
  }

  private async getSession(taskID: string): Promise<Session | undefined> {
    const result = await this.oc.session.list()
    if (result.error) {
      console.error("failed to list sessions:", result.error)
      throw new Error("Failed to list sessions")
    }

    const session = result.data?.find((s) => s.title === taskID)
    return session
  }

  private async createSession(task: TaskDTO): Promise<Session> {
    const result = await this.oc.session.create({ title: task.id })
    if (result.error) {
      console.error("failed to create session:", result.error)
      throw new Error("Failed to create session")
    }
    return result.data
  }

  private async subscribe() {
    const events = await this.oc.event.subscribe()
    for await (const event of events.stream) {
      if (
        event.type === "message.part.updated" &&
        event.properties.part.sessionID === this.sessionID
      ) {
        this.onEvent({
          name: "MESSAGE_PART_UPDATED_EVENT",
          data: {
            event,
          },
        })
      }
    }
  }
}
