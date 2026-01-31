import { os } from "@orpc/server"
import {
  createRepository as createRepositoryFn,
  listRepository as listRepositoryFn,
} from "@iron-giant/core/repository"
import { createRepositorySchema } from "@iron-giant/core/input"

export const createRepository = os
  .route({ method: "POST", path: "/repositories" })
  .input(createRepositorySchema)
  .handler(async ({ input }) => {
    return createRepositoryFn(input)
  })

export const listRepository = os
  .route({ method: "GET", path: "/repositories" })
  .handler(async () => {
    return listRepositoryFn()
  })

export const repository = {
  list: listRepository,
  create: createRepository,
}
