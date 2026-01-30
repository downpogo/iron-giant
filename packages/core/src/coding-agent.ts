import { Sandbox } from "./sandbox.js"

export class CodingAgent {
  sandbox: Sandbox
  httpPort = 4096

  constructor(sandbox: Sandbox) {
    this.sandbox = sandbox
  }

  async startHTTP(): Promise<void> {
    console.log("starting coding agent")
    await this.sandbox.executeCommandAsync(
      `opencode serve --port ${this.httpPort}`,
    )

    // wait for 2 seconds
    console.log("wait")
    await new Promise((r) => setTimeout(r, 2 * 1000))

    const url = await this.sandbox.getPreviewURL(this.httpPort)
    console.log("coding agent started running at:", url)
  }
}
