import { z } from "zod"
import { oc } from "@orpc/contract"
import { repositorySchema } from "@iron-giant/core/domain"
import {
  createRepositorySchema,
  editRepositorySchema,
} from "@iron-giant/core/input"

export const createRepository = oc
  .route({ method: "POST", path: "/repositories" })
  .input(createRepositorySchema)
  .output(z.object({ id: z.string() }))

export const listRepository = oc
  .route({ method: "GET", path: "/repositories" })
  .output(z.array(repositorySchema))

export const editRepository = oc
  .route({ method: "PUT", path: "/repositories/{repositoryID}" })
  .input(editRepositorySchema)
  .output(z.object({ id: z.string() }))

export const repository = {
  create: createRepository,
  edit: editRepository,
  list: listRepository,
}
