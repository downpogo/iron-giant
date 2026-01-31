import { onError, os } from "@orpc/server"
import {
  createRepository as createRepositoryFn,
  listRepository as listRepositoryFn,
} from "@iron-giant/core/repository"
import { createRepositorySchema } from "@iron-giant/core/repository/request"
import {
  createTask as createTaskFn,
  listTask as listTaskFn,
} from "@iron-giant/core/task"
import { createTaskSchema } from "@iron-giant/core/task/request"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { z } from "zod"

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

export const createTask = os
  .route({ method: "POST", path: "/repositories/{repositoryID}/tasks" })
  .input(createTaskSchema)
  .handler(async ({ input }) => {
    return createTaskFn(input)
  })

export const listTask = os
  .route({ method: "GET", path: "/repositories/{repositoryID}/tasks" })
  .input(z.object({ repositoryID: z.string() }))
  .handler(async ({ input }) => {
    return listTaskFn(input.repositoryID)
  })

export const router = {
  repository: {
    list: listRepository,
    create: createRepository,
  },
  task: {
    list: listTask,
    create: createTask,
  },
}

export const handler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.log(error)
    }),
  ],
})
