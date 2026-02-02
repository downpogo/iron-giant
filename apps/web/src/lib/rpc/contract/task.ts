import { z } from "zod"
import { oc } from "@orpc/contract"
import { taskSchema } from "@iron-giant/core/domain"
import { createTaskSchema, editTaskSchema } from "@iron-giant/core/input"

export const createTask = oc
  .route({ method: "POST", path: "/repositories/{repositoryID}/tasks" })
  .input(createTaskSchema)
  .output(z.object({ id: z.string() }))

export const listTask = oc
  .route({ method: "GET", path: "/repositories/{repositoryID}/tasks" })
  .input(
    z.object({
      repositoryID: z.string(),
    }),
  )
  .output(z.array(taskSchema))

export const getTask = oc
  .route({ method: "GET", path: "/repositories/{repositoryID}/tasks/{taskID}" })
  .input(
    z.object({
      repositoryID: z.string(),
      taskID: z.string(),
    }),
  )
  .output(taskSchema)

export const editTask = oc
  .route({ method: "PUT", path: "/repositories/{repositoryID}/tasks/{taskID}" })
  .input(editTaskSchema)
  .output(z.object({ id: z.string() }))

export const task = {
  create: createTask,
  edit: editTask,
  list: listTask,
  get: getTask,
}
