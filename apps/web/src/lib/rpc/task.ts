import { os } from "@orpc/server"
import {
  createTask as createTaskFn,
  getTask as getTaskFn,
  listTask as listTaskFn,
} from "@iron-giant/core/task"
import { createTaskSchema } from "@iron-giant/core/input"
import { z } from "zod"

const createTask = os
  .route({ method: "POST", path: "/repositories/{repositoryID}/tasks" })
  .input(createTaskSchema)
  .handler(async ({ input }) => {
    return createTaskFn(input)
  })

const listTask = os
  .route({ method: "GET", path: "/repositories/{repositoryID}/tasks" })
  .input(z.object({ repositoryID: z.string() }))
  .handler(async ({ input }) => {
    return listTaskFn(input.repositoryID)
  })

const getTask = os
  .route({ method: "GET", path: "/repositories/{repositoryID}/tasks/{taskID}" })
  .input(z.object({ repositoryID: z.string(), taskID: z.string() }))
  .handler(async ({ input }) => {
    return getTaskFn(input.repositoryID, input.taskID)
  })

export const task = {
  list: listTask,
  create: createTask,
  get: getTask,
}
