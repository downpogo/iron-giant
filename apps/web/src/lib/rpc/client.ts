import { createORPCClient, onError } from "@orpc/client"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import { OpenAPILink } from "@orpc/openapi-client/fetch"
import type { RouterClient } from "@orpc/server"
import type { AppRouter } from "./rpc.ts"

const router = null as unknown as AppRouter

const link = new OpenAPILink(router, {
  url: "http://localhost:3000/api",

  fetch: (request, init) => {
    return globalThis.fetch(request, init)
  },

  interceptors: [
    onError((error) => {
      console.error("openAPI link error:", error)
    }),
  ],
})

const client: RouterClient<AppRouter> = createORPCClient(link)

export const orpc = createTanstackQueryUtils(client)
