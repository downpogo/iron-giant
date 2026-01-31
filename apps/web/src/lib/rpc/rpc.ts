import { onError } from "@orpc/server"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { repository } from "./repository.ts"
import { task } from "./task.ts"

export const router = {
  repository,
  task,
}

export const handler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.error("rpc error:", error)
    }),
  ],
})

export type AppRouter = typeof router
