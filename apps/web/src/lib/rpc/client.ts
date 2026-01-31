import { createORPCClient, onError } from "@orpc/client"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import { OpenAPILink } from "@orpc/openapi-client/fetch"
import type { RouterClient } from "@orpc/server"
import type { Router } from "@/lib/rpc/router"
import { contract } from "@/lib/rpc/contract/contract"

const link = new OpenAPILink(contract, {
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

const client: RouterClient<Router> = createORPCClient(link)

export const orpc = createTanstackQueryUtils(client)
