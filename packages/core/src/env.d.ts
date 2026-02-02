import type { AgentDO } from "./durable-objects/agent-do"

declare global {
  type Env = {
    AGENT_DO: DurableObjectNamespace<AgentDO>
  }
}

export {}
