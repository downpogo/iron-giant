import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, rmSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'

import { getDBPath, openDB } from './database.js'

test('database path uses XDG_DATA_HOME', () => {
  const previousDataHome = process.env.XDG_DATA_HOME

  try {
    process.env.XDG_DATA_HOME = '/custom/data'
    assert.equal(getDBPath(), '/custom/data/iron-giant/db.sqlite')
  } finally {
    if (previousDataHome === undefined) {
      delete process.env.XDG_DATA_HOME
    } else {
      process.env.XDG_DATA_HOME = previousDataHome
    }
  }
})

test('database path falls back when XDG_DATA_HOME is missing or relative', () => {
  const previousDataHome = process.env.XDG_DATA_HOME
  const expected = join(homedir(), '.local', 'share', 'iron-giant', 'db.sqlite')

  try {
    delete process.env.XDG_DATA_HOME
    assert.equal(getDBPath(), expected)

    process.env.XDG_DATA_HOME = 'relative/path'
    assert.equal(getDBPath(), expected)
  } finally {
    if (previousDataHome === undefined) {
      delete process.env.XDG_DATA_HOME
    } else {
      process.env.XDG_DATA_HOME = previousDataHome
    }
  }
})

test('opening the database creates its directory and file', () => {
  const directory = mkdtempSync(join(tmpdir(), 'iron-giant-'))
  const previousDataHome = process.env.XDG_DATA_HOME

  try {
    process.env.XDG_DATA_HOME = directory

    const database = openDB()
    database.close()

    assert.equal(existsSync(join(directory, 'iron-giant', 'db.sqlite')), true)
  } finally {
    if (previousDataHome === undefined) {
      delete process.env.XDG_DATA_HOME
    } else {
      process.env.XDG_DATA_HOME = previousDataHome
    }

    rmSync(directory, { recursive: true, force: true })
  }
})
