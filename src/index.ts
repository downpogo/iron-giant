import { openDB } from './db/database.js'
import { UserStore } from './db/user-store.js'

const database = openDB()

try {
  new UserStore(database.db).getOrCreateLocalUser()
} finally {
  database.close()
}
