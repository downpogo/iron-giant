import { and, desc, inArray, eq } from "drizzle-orm"
import { ulid } from "ulid"
import { taskTable } from "../db/schema.js"
import type { CreateTaskInput } from "../input.js"
import type { Task } from "../domain.js"
import { getContext } from "../context.js"

export async function createTask(input: CreateTaskInput): Promise<string> {
  const { db } = getContext()

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

export async function listTask(repositoryID: string): Promise<Array<Task>> {
  const { db } = getContext()

  const rows = await db
    .select({
      id: taskTable.id,
      name: taskTable.name,
      description: taskTable.description,
      status: taskTable.status,
      repositoryBranch: taskTable.repositoryBranch,
    })
    .from(taskTable)
    .where(
      and(
        eq(taskTable.repositoryID, repositoryID),
        inArray(taskTable.status, ["TODO", "IN-PROGRESS"]),
      ),
    )
    .orderBy(desc(taskTable.updatedAt), desc(taskTable.createdAt))

  return rows
}

export async function getTask(
  repositoryID: string,
  taskID: string,
): Promise<Task> {
  const { db } = getContext()

  const rows = await db
    .select({
      id: taskTable.id,
      name: taskTable.name,
      description: taskTable.description,
      status: taskTable.status,
      repositoryBranch: taskTable.repositoryBranch,
    })
    .from(taskTable)
    .where(
      and(eq(taskTable.id, taskID), eq(taskTable.repositoryID, repositoryID)),
    )

  const task = rows[0]
  if (!task) {
    throw new Error("Task not found")
  }

  return task
}
