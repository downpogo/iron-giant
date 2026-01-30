import { sqliteTable, text } from "drizzle-orm/sqlite-core"

export const repositoryTable = sqliteTable("repositories", {
  id: text("id").primaryKey(),

  name: text("name").notNull(),
  url: text("url").notNull(),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const taskTable = sqliteTable("tasks", {
  id: text("id").primaryKey(),

  // TODO: Decide whether deleting a repository should delete its tasks.
  repositoryID: text("repository_id")
    .notNull()
    .references(() => repositoryTable.id),

  name: text("name").notNull(),
  description: text("description").notNull(),
  status: text("status", {
    enum: ["TODO", "IN-PROGRESS", "COMPLETED"],
  }).notNull(),

  repositoryBranch: text("repository_branch").notNull(),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})
