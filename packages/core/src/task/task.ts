import { type CreateTaskInput } from "../input.js"
import * as db from "./db.js"
export { listTask, getTask } from "./db.js"

export async function createTask(
  input: CreateTaskInput,
): Promise<{ id: string }> {
  const id = await db.createTask(input)
  return { id }
}
