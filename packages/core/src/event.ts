export type AppEvent =
  | creatingStandboxEvent
  | cloningRepoEvent
  | buildingTemplateEvent
  | creatingSessionEvent
  | errorEvent

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

export type OnEvent = (event: AppEvent) => void
