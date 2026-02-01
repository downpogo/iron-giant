import { Template } from "e2b"
import { Sandbox as E2BSandbox } from "@e2b/code-interpreter"

export class Sandbox {
  private sandbox!: E2BSandbox

  // Creates sandbox for the the task
  async createFromTask(taskID: string, repoURL: string, repoBranch: string) {
    // Connect to sandbox if already exists
    const sandboxBoxID = await this.hasSandboxForTask(taskID)
    if (sandboxBoxID) {
      console.log("connecting to existing sandbox")
      this.sandbox = await E2BSandbox.connect(sandboxBoxID)
      return
    }

    // Get base image using repo url
    const parsedURL = new URL(repoURL)
    const repoName = parsedURL.pathname.split("/")[2]

    // Build the template using the base image
    const imageName = `${repoName}-sandbox`
    const template = Template().fromImage(imageName)

    console.log("building template from image:", imageName)
    await Template.build(template, imageName)

    // Create the sandbox
    console.log("creating sandbox")
    this.sandbox = await E2BSandbox.create(imageName, {
      allowInternetAccess: true,
      metadata: { taskID },
    })

    // Clone the repo
    console.log("cloning repo")
    await this.sandbox.commands.run(`git clone -b ${repoBranch} ${repoURL}`)
  }

  // Deletes the sandbox
  delete(): Promise<void> {
    return this.sandbox.kill()
  }

  // Executes the given command asynchronously
  async executeCommandAsync(command: string): Promise<void> {
    await this.sandbox.commands.run(command, { background: true })
  }

  // Gets the preview url
  async getPreviewURL(port: number): Promise<string> {
    return `https://${this.sandbox.getHost(port)}`
  }

  // Checks if sandbox already created for task
  async hasSandboxForTask(taskID: string): Promise<string | null> {
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
    return sandbox.sandboxId
  }
}
