import { type CreateRepositoryInput } from "../input.js"
import * as db from "./db.js"

export type Repository = {
  id: string
  name: string
  url: string
}

export async function createRepository(
  input: CreateRepositoryInput,
): Promise<{ id: string }> {
  const id = await db.createRepository(input)
  return { id }
}

export async function listRepository(): Promise<Array<Repository>> {
  return db.listRepository()
}
