import {
  createRepositorySchema,
  type CreateRepositoryInput,
} from "./request.js"
import * as db from "./db.js"

export type Repository = {
  id: string
  name: string
  url: string
}

export async function createRepository(
  input: CreateRepositoryInput,
): Promise<string> {
  const parsedInput = createRepositorySchema.parse(input)
  return db.createRepository(parsedInput)
}

export async function listRepository(): Promise<Array<Repository>> {
  return db.listRepository()
}
