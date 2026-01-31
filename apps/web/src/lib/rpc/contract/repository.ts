import { z } from "zod"
import { oc } from "@orpc/contract"
import { repositorySchema } from "@iron-giant/core/domain"
import { createRepositorySchema } from "@iron-giant/core/input"

export const createRepository = oc
  .route({ method: "POST", path: "/repositories" })
  .input(createRepositorySchema)
  .output(z.object({ id: z.string() }))

export const listRepository = oc
  .route({ method: "GET", path: "/repositories" })
  .output(z.array(repositorySchema))

export const repository = {
  create: createRepository,
  list: listRepository,
}
