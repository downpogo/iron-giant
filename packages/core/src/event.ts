import type { CodingAgentMessage } from "./domain"
import type { EventMessagePartUpdated } from "@opencode-ai/sdk/v2"

export type AppEvent =
  | creatingStandboxEvent
  | cloningRepoEvent
  | buildingTemplateEvent
  | creatingSessionEvent
  | errorEvent
  | codingAgentMessageEvent
  | messagePartUpdatedEvent

type creatingStandboxEvent = {
  name: "CREATING_SANDBOX"
}

type cloningRepoEvent = {
  name: "CLONING_REPO"
  data: {
    url: string
  }
}

type buildingTemplateEvent = {
  name: "BUILDING_TEMPLATE"
  data: {
    imageName: string
    templateName: string
  }
}

type creatingSessionEvent = {
  name: "CREATING_SESSION"
}

type errorEvent = {
  name: "ERROR"
  data: {
    message: string
  }
}

type codingAgentMessageEvent = {
  name: "CODING_AGENT_MESSAGE"
  data: {
    message: CodingAgentMessage
  }
}

type messagePartUpdatedEvent = {
  name: "MESSAGE_PART_UPDATED_EVENT"
  data: {
    event: EventMessagePartUpdated
  }
}

export type OnEvent = (event: AppEvent) => void
