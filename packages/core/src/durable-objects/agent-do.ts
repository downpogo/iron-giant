import { DurableObject } from "cloudflare:workers"
import type { TaskDTO } from "../dto"
import { ulid } from "ulid"
import { Sandbox } from "../sandbox.js"
import { CodingAgent } from "../coding-agent"

export class AgentDO extends DurableObject {
  private task!: TaskDTO

  // Maintain connections and reconstruct it after waking up (hibernation)
  private connections: Map<WebSocket, { [key: string]: string }>

  private sandbox: Sandbox | null = null

  private agent: CodingAgent
  private agentSessionID: string | null = null

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)

    this.connections = new Map()
    this.agent = new CodingAgent()

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

      const agentSessionID =
        await this.ctx.storage.get<string>("agentSessionID")
      if (agentSessionID) {
        this.agentSessionID = agentSessionID
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
    await this.setupSandboxAndAgent()
    this.agent.sendMessage(message.toString())
  }

  async setupSandboxAndAgent(): Promise<void> {
    if (!this.sandbox) {
      return
    }

    const sandbox = new Sandbox()
    await sandbox.getOrCreate(this.task)

    const agentURL = await this.sandbox.getAgentURL()
    const sessionID = await this.agent.getOrCreateSession(
      this.agentSessionID,
      agentURL,
    )

    this.agentSessionID = sessionID
    await this.ctx.storage.put("agentSessionID", sessionID)

    this.sandbox = sandbox
  }

  webSocketClose(ws: WebSocket, code: number, reason: string): void {
    ws.close(code, reason)
    this.connections.delete(ws)
  }
}
