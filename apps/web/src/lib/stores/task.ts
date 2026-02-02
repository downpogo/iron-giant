import { create } from "zustand"
import { immer } from "zustand/middleware/immer"
import type { CodingAgentMessage } from "@iron-giant/core/domain"
import type { Draft } from "immer"

type State = {
  messages: Array<CodingAgentMessage>
}

type Actions = {
  addMessage: (message: CodingAgentMessage) => void
}

type TaskStore = State & Actions

const initializer = (
  set: (fn: (state: Draft<TaskStore>) => void) => void,
): TaskStore => ({
  messages: [],

  addMessage: (message) =>
    set((state) => {
      const existingIndex = state.messages.findIndex(
        (item) => item.id === message.id,
      )

      if (existingIndex === -1) {
        state.messages.push(message)
        return
      }

      state.messages[existingIndex] = message
    }),
})

export const useTaskStore = create<TaskStore>()(immer(initializer))
