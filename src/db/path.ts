import { homedir } from 'node:os'
import { isAbsolute, join } from 'node:path'

export function getDBPath() {
  const dataRoot =
    process.env.XDG_DATA_HOME && isAbsolute(process.env.XDG_DATA_HOME)
      ? process.env.XDG_DATA_HOME
      : join(homedir(), '.local', 'share')

  return join(dataRoot, 'iron-giant', 'db.sqlite')
}
