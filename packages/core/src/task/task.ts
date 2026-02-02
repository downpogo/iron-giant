import { type CreateTaskInput, type EditTaskInput } from "../input.js"
import { getTaskDO } from "../durable-objects/agent-do.js"
import { getContext } from "../context.js"
import { getRepository } from "../repository/db.js"
import * as db from "./db.js"
import type { TaskDTO } from "../dto.js"
export { listTask, getTask } from "./db.js"

export async function createTask(
  input: CreateTaskInput,
): Promise<{ id: string }> {
  const { env } = getContext()

  const repository = await getRepository(input.repositoryID)
  const id = await db.createTask(input)

  const task: TaskDTO = {
    id,
    repositoryURL: repository.url,
    repositoryBranch: input.repositoryBranch,
  }

  await getTaskDO(env, id).init(task)
  return { id }
}

export async function editTask(input: EditTaskInput): Promise<{ id: string }> {
  const id = await db.editTask(input)
  return { id }
}
