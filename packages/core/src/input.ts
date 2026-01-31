import { z } from "zod"

// repository
export const createRepositorySchema = z.object({
  name: z.string().min(1),
  url: z.url().min(1),
})

export type CreateRepositoryInput = z.infer<typeof createRepositorySchema>

// task
export const createTaskSchema = z.object({
  repositoryID: z.string(),

  name: z.string().trim(),
  description: z.string().trim(),

  repositoryBranch: z.string().trim(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
