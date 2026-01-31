import { z } from "zod"

export const repositorySchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.url(),
})

export const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(["TODO", "IN-PROGRESS", "COMPLETED"]),
  repositoryBranch: z.string(),
})

export type Repository = z.infer<typeof repositorySchema>

export type Task = z.infer<typeof taskSchema>
