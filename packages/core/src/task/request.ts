import { z } from "zod"

export const createTaskSchema = z.object({
  repositoryID: z.string(),

  name: z.string().trim(),
  description: z.string().trim(),

  repositoryBranch: z.string().trim(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
