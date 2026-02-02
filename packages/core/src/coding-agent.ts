import { OpencodeClient } from "@opencode-ai/sdk/v2"
import { createOpencodeClient } from "@opencode-ai/sdk/v2"

export class CodingAgent {
  oc!: OpencodeClient
  sessionID!: string

  async getOrCreateSession(
    sessionID: string | null,
    url: string,
  ): Promise<string> {
    this.oc = createOpencodeClient({ baseUrl: url })

    if (!sessionID) {
      const session = await this.oc.session.create()
      if (session.error) {
        throw new Error("failed to create session")
      }

      this.sessionID = session.data.id
      return this.sessionID
    }

    this.sessionID = sessionID
    return this.sessionID
  }

  // TODO: stream the data to durable object which will stream it to client
  async sendMessage(message: string) {
    const result = await this.oc.session.prompt({
      sessionID: this.sessionID,
      parts: [{ type: "text", text: message }],
    })

    if (result.error) {
      console.log("failed to send message:", result.error.data)
    }

    console.log("coding agent message reply:", result.data)
  }
}
