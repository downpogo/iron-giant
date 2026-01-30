import { createTaskSchema, type CreateTaskInput } from "./request.js"
import * as db from "./db.js"

export type Task = {
  id: string

  name: string
  description: string
  status: "TODO" | "IN-PROGRESS" | "COMPLETED"

  repositoryBranch: string
}

export async function createTask(input: CreateTaskInput): Promise<string> {
  const parsedInput = createTaskSchema.parse(input)
  return db.createTask(parsedInput)
}

export async function listTasks(): Promise<Array<Task>> {
  return db.listTasks()
}
