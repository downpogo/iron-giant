import type { drizzle } from "drizzle-orm/d1"
import { AsyncLocalStorage } from "node:async_hooks"

type ContextValue = {
  db: ReturnType<typeof drizzle>
}

const asyncLocalStorage = new AsyncLocalStorage<ContextValue>()

export function withContext<T>(context: ContextValue, fn: () => T): T {
  return asyncLocalStorage.run(context, fn)
}

export function getContext(): ContextValue {
  if (!asyncLocalStorage) {
    throw new Error("context is not created")
  }

  const store = asyncLocalStorage.getStore()
  return store!
}
