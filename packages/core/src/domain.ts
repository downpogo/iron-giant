export type Repository = {
  id: string
  name: string
  url: string
}

export type Task = {
  id: string

  name: string
  description: string
  status: "TODO" | "IN-PROGRESS" | "COMPLETED"

  repositoryBranch: string
}
