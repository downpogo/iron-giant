import { DurableObject } from "cloudflare:workers"
import type { Command } from "../command"
import type { TaskDTO } from "../dto"
import { ulid } from "ulid"
import { Sandbox } from "../sandbox.js"
import { CodingAgent } from "../coding-agent"
import type { AppEvent } from "../event"
import type { CodingAgentMessage } from "../domain"
import type { EventMessagePartUpdated } from "@opencode-ai/sdk/v2"
import type { ReasoningPart, TextPart } from "@opencode-ai/sdk"

export class AgentDO extends DurableObject {
  private task!: TaskDTO

  // Maintain connections and reconstruct it after waking up (hibernation)
  private connections: Map<WebSocket, { [key: string]: string }>

  private sandbox: Sandbox | null = null
  private agent: CodingAgent

  private messages: Map<string, CodingAgentMessage>

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)

    this.connections = new Map()
    this.agent = new CodingAgent()
    this.messages = new Map<string, CodingAgentMessage>()

    this.ctx.getWebSockets().forEach((ws) => {
      const attachment = ws.deserializeAttachment()
      if (attachment) {
        this.connections.set(ws, { ...attachment })
      }
    })

    this.ctx.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair("ping", "pong"),
    )

    ctx.blockConcurrencyWhile(async () => {
      const task = await this.ctx.storage.get<TaskDTO>("task")
      if (task) {
        this.task = task
      }
    })
  }

  fetch(): Response {
    const websocketPair = new WebSocketPair()
    const [client, server] = Object.values(websocketPair)

    const wsServer = server!
    this.ctx.acceptWebSocket(wsServer)

    const id = ulid()
    wsServer.serializeAttachment({ id })
    this.connections.set(wsServer, { id })

    return new Response(null, { status: 101, webSocket: client })
  }

  async init(task: TaskDTO): Promise<void> {
    this.task = task
    await this.ctx.storage.put("task", task)
  }

  async webSocketMessage(
    _ws: WebSocket,
    message: string | ArrayBuffer,
  ): Promise<void> {
    try {
      await this.setupSandboxAndAgent()

      const payload =
        typeof message === "string"
          ? message
          : new TextDecoder().decode(message)

      const command = JSON.parse(payload) as Command

      switch (command.name) {
        case "SEND_MESSAGE": {
          await this.agent.sendMessage(command.data.message)
          break
        }
        default: {
          throw new Error(`Unknown command: ${command.name}`)
        }
      }
    } catch (err) {
      console.error("failed to handle ws message", err)
      this.broadcast({
        name: "ERROR",
        data: {
          message: (err as Error).message,
        },
      })
    }
  }

  private broadcast(event: AppEvent): void {
    const payload = JSON.stringify(event)
    this.connections.forEach((_, ws) => {
      ws.send(payload)
    })
  }

  async setupSandboxAndAgent(): Promise<void> {
    if (this.sandbox) {
      return
    }

    const sandbox = new Sandbox()
    await sandbox.getOrCreate(this.task, (event) => this.broadcast(event))

    const agentURL = await sandbox.getAgentURL()
    await this.agent.getOrCreateSession(this.task, agentURL, (event) =>
      event.name === "MESSAGE_PART_UPDATED_EVENT"
        ? this.messagePartUpdated(event.data.event)
        : this.broadcast(event),
    )

    this.sandbox = sandbox
  }

  webSocketClose(ws: WebSocket, code: number, reason: string): void {
    ws.close(code, reason)
    this.connections.delete(ws)
  }

  // coding message helpers for doing transformation
  async messagePartUpdated(event: EventMessagePartUpdated) {
    const { part } = event.properties
    const messageID = part.messageID

    let codingAgentMessage = this.messages.get(messageID)

    if (!codingAgentMessage) {
      const newMessage = {
        id: messageID,
        parts: [],
      }
      this.messages.set(messageID, newMessage)
      codingAgentMessage = newMessage
    }

    switch (part.type) {
      case "text":
      case "reasoning": {
        this.upsertPart(codingAgentMessage, part)
        break
      }
    }

    this.messages.set(messageID, codingAgentMessage!)

    this.broadcast({
      name: "CODING_AGENT_MESSAGE",
      data: {
        message: codingAgentMessage,
      },
    })
  }

  private upsertPart(
    message: CodingAgentMessage,
    ocPart: TextPart | ReasoningPart,
  ): CodingAgentMessage {
    const part = {
      name: ocPart.type,
      data: {
        id: ocPart.id,
        text: ocPart.text,
      },
    }

    const index = message.parts.findIndex((p) => p.data.id === ocPart.id)
    if (index === -1) {
      message.parts.push(part)
    }

    message.parts[index] = part
    return message
  }
}

export function getTaskDO(env: Env, taskID: string) {
  return env.AGENT_DO.getByName(taskID)
}
