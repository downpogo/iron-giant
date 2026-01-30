import { desc } from "drizzle-orm"
import { ulid } from "ulid"
import { getDB } from "../db/index.js"
import { repositoryTable } from "../db/schema.js"
import type { CreateRepositoryInput } from "./request.js"
import type { Repository } from "./repository.js"

export async function createRepository(
  input: CreateRepositoryInput,
): Promise<string> {
  const db = getDB()

  const id = ulid()
  const now = new Date().toISOString()

  const res = await db
    .insert(repositoryTable)
    .values({
      id,
      ...input,
      createdAt: now,
      updatedAt: now,
    })
    .returning({
      id: repositoryTable.id,
    })

  const row = res[0]
  if (!row) {
    throw new Error("Failed to create repository")
  }

  return row.id
}

export async function listRepository(): Promise<Array<Repository>> {
  const db = getDB()

  return db
    .select({
      id: repositoryTable.id,
      name: repositoryTable.name,
      url: repositoryTable.url,
    })
    .from(repositoryTable)
    .orderBy(desc(repositoryTable.updatedAt), desc(repositoryTable.createdAt))
}
