import { type CreateTaskInput } from "./request.js"
import * as db from "./db.js"

export type Task = {
  id: string

  name: string
  description: string
  status: "TODO" | "IN-PROGRESS" | "COMPLETED"

  repositoryBranch: string
}

export async function createTask(
  input: CreateTaskInput,
): Promise<{ id: string }> {
  const id = await db.createTask(input)
  return { id }
}

export async function listTask(repositoryID: string): Promise<Array<Task>> {
  return db.listTask(repositoryID)
}
