import { implement, onError } from "@orpc/server"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import {
  createRepository as createRepositoryFn,
  listRepository as listRepositoryFn,
} from "@iron-giant/core/repository"
import {
  createTask as createTaskFn,
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

export const router = os.router({
  repository: {
    create: createRepository,
    list: listRepository,
  },
  task: {
    create: createTask,
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
