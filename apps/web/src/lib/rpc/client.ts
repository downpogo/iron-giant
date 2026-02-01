import { createORPCClient, onError } from "@orpc/client"
import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import { OpenAPILink } from "@orpc/openapi-client/fetch"
import { webEnv } from "@iron-giant/core/env/web"
import type { RouterClient } from "@orpc/server"
import type { Router } from "@/lib/rpc/router"
import { contract } from "@/lib/rpc/contract/contract"

const link = new OpenAPILink(contract, {
  url: `${webEnv.VITE_WEB_URL}/api`,

  interceptors: [
    onError((error) => {
      console.error("openAPI link error:", error)
    }),
  ],
})

const client: RouterClient<Router> = createORPCClient(link)

export const orpc = createTanstackQueryUtils(client)
