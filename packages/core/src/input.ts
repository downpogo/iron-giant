import { z } from "zod"

// repository
export const createRepositorySchema = z.object({
  name: z.string().min(1),
  url: z.url().min(1),
})

export type CreateRepositoryInput = z.infer<typeof createRepositorySchema>

export const editRepositorySchema = z.object({
  repositoryID: z.string(),

  name: z.string().min(1).optional(),
  url: z.url().min(1).optional(),
})

export type EditRepositoryInput = z.infer<typeof editRepositorySchema>

// task
export const createTaskSchema = z.object({
  repositoryID: z.string(),

  name: z.string().trim(),
  description: z.string().trim(),

  repositoryBranch: z.string().trim(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

export const editTaskSchema = z.object({
  repositoryID: z.string(),
  taskID: z.string(),

  name: z.string().trim().optional(),
  description: z.string().trim().optional(),
  status: z.enum(["TODO", "IN-PROGRESS", "COMPLETED"]).optional(),
  repositoryBranch: z.string().trim().optional(),
})

export type EditTaskInput = z.infer<typeof editTaskSchema>
