import { z } from "zod"

export const createRepositorySchema = z.object({
  name: z.string().min(1),
  url: z.url().min(1),
})

export type CreateRepositoryInput = z.infer<typeof createRepositorySchema>
