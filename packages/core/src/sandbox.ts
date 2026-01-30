import { Image, Daytona, Sandbox as DaytonaSandbox } from "@daytonaio/sdk"

export class Sandbox {
  private daytona: Daytona
  private sandbox!: DaytonaSandbox
  private sessionID!: string

  constructor() {
    this.daytona = new Daytona()
  }

  // Creates the sanbox
  async create(): Promise<void> {
    const snapshot = await this.getOrCreateSnapshot()

    this.sandbox = await this.daytona.create({
      public: true,
      snapshot,
    })

    this.sessionID = crypto.randomUUID()
    console.log("creating sandbox session")
    await this.sandbox.process.createSession(this.sessionID)

    console.log("sandbox created")
  }

  // Gets the snapshot or creates if doesn't exists
  async getOrCreateSnapshot(): Promise<string> {
    // TODO: Name should be derived based on the github URL
    const snapshotName = "memento-sandbox"

    const hasSnapshot = await this.daytona.snapshot.get(snapshotName).then(
      () => true,
      () => false,
    )

    if (!hasSnapshot) {
      console.log("creating snaphot...")
      await this.daytona.snapshot.create({
        name: snapshotName,
        // TODO: Figure out a way to get the docker registry username
        image: Image.base(`downpogo/${snapshotName}`),
      })
    } else {
      console.log("using existing snaphot...")
    }

    return snapshotName
  }

  // Deletes the sandbox
  delete(): Promise<void> {
    return this.sandbox.delete()
  }

  // Executes the given command asynchronously
  async executeCommandAsync(command: string): Promise<void> {
    await this.sandbox.process.executeSessionCommand(this.sessionID, {
      command,
      runAsync: true,
    })
  }

  // Gets the preview url
  async getPreviewURL(port: number): Promise<string> {
    const link = await this.sandbox.getPreviewLink(port)
    return link.url
  }
}
