import {
  defaultBuildLogger,
  Template,
  waitForPort,
  type SandboxInfo,
} from "e2b"
import { Sandbox as E2BSandbox } from "@e2b/code-interpreter"
import type { TaskDTO } from "./dto"
import type { OnEvent, AppEvent } from "./event.js"

const AGENT_PORT = 4096

const AGENT_START_CMD = `curl -fsSL https://opencode.ai/install | bash && export PATH="$HOME/.opencode/bin:$PATH" && opencode serve --hostname 0.0.0.0 --port ${AGENT_PORT}`

export class Sandbox {
  private sandbox!: E2BSandbox
  onEvent!: (event: AppEvent) => void

  async getOrCreate(task: TaskDTO, onEvent?: OnEvent): Promise<void> {
    this.onEvent = onEvent ? onEvent : () => {}

    const sb = await this.getSandbox(task.id)
    if (sb) {
      this.sandbox = await E2BSandbox.connect(sb.sandboxId)
      return
    }

    const templateName = await this.buildTemplate(task.repositoryURL)

    this.onEvent({
      name: "CREATING_SANDBOX",
    })
    this.sandbox = await E2BSandbox.create(templateName, {
      allowInternetAccess: true,
      metadata: { taskID: task.id },
    })

    this.onEvent({
      name: "CLONING_REPO",
      data: {
        url: task.repositoryURL,
      },
    })
    await this.sandbox.commands.run(
      `git clone -b ${task.repositoryBranch} ${task.repositoryURL}`,
    )
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
      return templateName
    }

    const imageName = `${repoOwner}/${repoName}-sandbox:latest`

    const template = Template()
      .fromImage(imageName)
      .setStartCmd(AGENT_START_CMD, waitForPort(AGENT_PORT))

    this.onEvent({
      name: "BUILDING_TEMPLATE",
      data: {
        imageName,
        templateName,
      },
    })
    await Template.build(template, templateName, {
      onBuildLogs: defaultBuildLogger({ minLevel: "debug" }),
    })

    return templateName
  }

  async getAgentURL() {
    const url = await this.getPreviewURL(AGENT_PORT)
    return url
  }
}
