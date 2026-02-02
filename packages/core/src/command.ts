export type Command = SendMesssgeCMD

type SendMesssgeCMD = {
  name: "SEND_MESSAGE"
  data: {
    message: string
  }
}
