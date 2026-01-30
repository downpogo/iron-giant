// src/server.ts
import { withContext } from "@iron-giant/core/context"
import { createDB } from "@iron-giant/core/db"
import handler, { createServerEntry } from "@tanstack/react-start/server-entry"
import { env } from "cloudflare:workers"

export default createServerEntry({
  fetch(request) {
    const db = createDB(env.DB)

    const context = {
      db,
    }

    return withContext(context, () => handler.fetch(request))
  },
})
