import { desc, inArray } from "drizzle-orm"
import { ulid } from "ulid"
import { getDB } from "../db/index.js"
import { taskTable } from "../db/schema.js"
import type { CreateTaskInput } from "./request.js"
import type { Task } from "./task.js"

export async function createTask(input: CreateTaskInput): Promise<string> {
  const db = getDB()

  const id = ulid()
  const now = new Date().toISOString()

  const res = await db
    .insert(taskTable)
    .values({
      id,
      ...input,
      status: "TODO",
      createdAt: now,
      updatedAt: now,
    })
    .returning({
      id: taskTable.id,
    })

  const row = res[0]
  if (!row) {
    throw new Error("Failed to create task")
  }

  return row.id
}

export async function listTasks(): Promise<Array<Task>> {
  const db = getDB()

  const rows = await db
    .select({
      id: taskTable.id,
      name: taskTable.name,
      description: taskTable.description,
      status: taskTable.status,
      repositoryBranch: taskTable.repositoryBranch,
    })
    .from(taskTable)
    .where(inArray(taskTable.status, ["TODO", "IN-PROGRESS"]))
    .orderBy(desc(taskTable.updatedAt), desc(taskTable.createdAt))

  return rows
}
