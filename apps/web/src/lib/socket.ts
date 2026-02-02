import { WebSocket } from "partysocket"
import { useTaskStore } from "./stores/task"
import type { AppEvent } from "node_modules/@iron-giant/core/src/event"
import type { Command } from "@iron-giant/core/command"

type SocketOptions = {
  repositoryID: string
  taskID: string
}

export class Socket {
  private socket: WebSocket | null = null
  private opts: SocketOptions

  constructor(opts: SocketOptions) {
    this.opts = opts
  }

  init(): void {
    if (this.socket) {
      return
    }

    this.socket = new WebSocket(this.getURL())

    this.socket.addEventListener("open", (event) => {
      console.log("ws: connection opened", event)
    })

    this.socket.addEventListener("message", (event) => {
      try {
        const appEvent = JSON.parse(event.data) as AppEvent
        console.log("app event:", appEvent)

        if (appEvent.name === "CODING_AGENT_MESSAGE") {
          useTaskStore.getState().addMessage(appEvent.data.message)
        }
      } catch (err) {
        console.error("ws: failed to parse ws message:", err)
      }
    })

    this.socket.addEventListener("close", (event) => {
      console.log("ws: connection closed:", event)
    })

    this.socket.addEventListener("error", (event) => {
      console.log("ws: connection closed:", event)
    })
  }

  disconnect(): void {
    if (!this.socket) {
      return
    }

    this.socket.close()
    this.socket = null
  }

  send(command: Command): void {
    if (!this.socket) {
      console.log("ws: skip.sendMessage: empty socket")
      return
    }
    this.socket.send(JSON.stringify(command))
  }

  getURL(): string {
    const { repositoryID, taskID } = this.opts
    const { protocol, host } = new URL(window.origin)

    let url = "wss:"
    if (protocol === "http:") {
      url = "ws:"
    }
    url += `//${host}/api/repositories/${repositoryID}/tasks/${taskID}/connect`

    return url
  }
}
