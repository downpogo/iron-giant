import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import {
  getCredentialsPath,
  InsecureFileCredentialStore,
} from './credentials.js'

test('insecure credential storage uses XDG config with restricted permissions', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'iron-giant-'))
  const previousConfigHome = process.env.XDG_CONFIG_HOME

  try {
    process.env.XDG_CONFIG_HOME = directory
    const store = new InsecureFileCredentialStore()
    const key = { provider: 'github', providerAccountId: '123' }

    await store.set(key, 'secret-token')

    assert.equal(await store.get(key), 'secret-token')
    assert.equal(
      getCredentialsPath(),
      join(directory, 'iron-giant', 'credentials.json'),
    )
    assert.equal(statSync(getCredentialsPath()).mode & 0o777, 0o600)
    assert.equal(statSync(join(directory, 'iron-giant')).mode & 0o777, 0o700)
  } finally {
    if (previousConfigHome === undefined) {
      delete process.env.XDG_CONFIG_HOME
    } else {
      process.env.XDG_CONFIG_HOME = previousConfigHome
    }

    rmSync(directory, { recursive: true, force: true })
  }
})
