export type Command =
  | {
      name: "SEND_MESSAGE"
      data: {
        message: string
      }
    }
  | {
      name: "ACK"
      data: {
        command: Command["name"]
      }
    }
