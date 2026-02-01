import { Template, waitForPort, type SandboxInfo } from "e2b"
import { Sandbox as E2BSandbox } from "@e2b/code-interpreter"

const AGENT_PORT = 3000
const AGENT_START_CMD = `sandbox-agent server --no-token --host 0.0.0.0 --port ${AGENT_PORT}`

export class Sandbox {
  private sandbox!: E2BSandbox

  async create(taskID: string, repoURL: string, repoBranch: string) {
    const sb = await this.getSandbox(taskID)
    if (sb) {
      console.log("connecting to existing sandbox")
      this.sandbox = await E2BSandbox.connect(sb.sandboxId)
      return
    }

    const templateName = await this.buildTemplate(repoURL)

    console.log("creating sandbox")
    this.sandbox = await E2BSandbox.create(templateName, {
      allowInternetAccess: true,
      metadata: { taskID },
    })
    console.log("sandbox created:", this.sandbox.sandboxId)

    console.log("cloning repo:", repoURL)
    await this.sandbox.commands.run(`git clone -b ${repoBranch} ${repoURL}`)

    const url = await this.getPreviewURL(AGENT_PORT)
    console.log("agent running at:", url)
  }

  delete(): Promise<void> {
    return this.sandbox.kill()
  }

  async executeCommandAsync(command: string): Promise<void> {
    await this.sandbox.commands.run(command, { background: true })
  }

  async getPreviewURL(port: number): Promise<string> {
    return `https://${this.sandbox.getHost(port)}`
  }

  async getSandbox(taskID: string): Promise<SandboxInfo | null> {
    const paginator = E2BSandbox.list({
      limit: 1,
      query: {
        state: ["running", "paused"],
        metadata: { taskID },
      },
    })

    const sandboxes = await paginator.nextItems()
    if (!sandboxes.length) {
      return null
    }

    const sandbox = sandboxes[0]!
    return sandbox
  }

  async buildTemplate(repoURL: string): Promise<string> {
    const parsedURL = new URL(repoURL)
    const [, repoOwner, repoName] = parsedURL.pathname.split("/")

    const templateName = `${repoName}-sandbox`

    const hasTemplate = await Template.exists(templateName)
    if (hasTemplate) {
      console.log("skipping building template")
      return templateName
    }

    const imageName = `${repoOwner}/${repoName}-sandbox:latest`

    const template = Template()
      .fromImage(imageName)
      .setStartCmd(AGENT_START_CMD, waitForPort(AGENT_PORT))

    console.log("building template from image:", imageName)
    await Template.build(template, templateName)

    return imageName
  }
}
