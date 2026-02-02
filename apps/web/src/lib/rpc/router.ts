import { implement, onError } from "@orpc/server"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import {
  createRepository as createRepositoryFn,
  editRepository as editRepositoryFn,
  listRepository as listRepositoryFn,
} from "@iron-giant/core/repository"
import {
  createTask as createTaskFn,
  editTask as editTaskFn,
  getTask as getTaskFn,
  listTask as listTaskFn,
} from "@iron-giant/core/task"
import { contract } from "@/lib/rpc/contract/contract"

const os = implement(contract)

// repository
export const createRepository = os.repository.create.handler(
  async ({ input }) => {
    return createRepositoryFn(input)
  },
)

export const listRepository = os.repository.list.handler(async () => {
  return listRepositoryFn()
})

export const editRepository = os.repository.edit.handler(async ({ input }) => {
  return editRepositoryFn(input)
})

// task
const createTask = os.task.create.handler(async ({ input }) => {
  return createTaskFn(input)
})

const listTask = os.task.list.handler(async ({ input }) => {
  return listTaskFn(input.repositoryID)
})

const getTask = os.task.get.handler(async ({ input }) => {
  return getTaskFn(input.repositoryID, input.taskID)
})

const editTask = os.task.edit.handler(async ({ input }) => {
  return editTaskFn(input)
})

export const router = os.router({
  repository: {
    create: createRepository,
    edit: editRepository,
    list: listRepository,
  },
  task: {
    create: createTask,
    edit: editTask,
    get: getTask,
    list: listTask,
  },
})

export const handler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      console.error("rpc error:", error)
    }),
  ],
})

export type Router = typeof router
