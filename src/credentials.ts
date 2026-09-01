import { AsyncEntry } from '@napi-rs/keyring'
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { dirname, isAbsolute, join } from 'node:path'
import { z } from 'zod'

import type { CredentialKey, CredentialStore } from '@/app/login.js'

const credentialsSchema = z.record(z.string(), z.string())

export class KeychainCredentialStore implements CredentialStore {
  async get(key: CredentialKey) {
    try {
      return await new AsyncEntry('iron-giant', keyName(key)).getPassword()
    } catch (error) {
      throw keychainUnavailable(error)
    }
  }

  async set(key: CredentialKey, secret: string) {
    try {
      await new AsyncEntry('iron-giant', keyName(key)).setPassword(secret)
    } catch (error) {
      throw keychainUnavailable(error)
    }
  }
}

export class InsecureFileCredentialStore implements CredentialStore {
  async get(key: CredentialKey) {
    return readCredentials()[keyName(key)]
  }

  async set(key: CredentialKey, secret: string) {
    const path = getCredentialsPath()
    const directory = dirname(path)
    const temporaryPath = `${path}.${process.pid}.tmp`
    const credentials = readCredentials()
    credentials[keyName(key)] = secret

    mkdirSync(directory, { recursive: true, mode: 0o700 })
    chmodSync(directory, 0o700)

    try {
      writeFileSync(
        temporaryPath,
        `${JSON.stringify(credentials, null, 2)}\n`,
        {
          encoding: 'utf8',
          mode: 0o600,
        },
      )
      renameSync(temporaryPath, path)
      chmodSync(path, 0o600)
    } catch (error) {
      if (existsSync(temporaryPath)) {
        unlinkSync(temporaryPath)
      }
      throw error
    }
  }
}

export class StoredCredentialReader {
  constructor(
    private readonly keychain: CredentialStore = new KeychainCredentialStore(),
    private readonly plaintext: CredentialStore = new InsecureFileCredentialStore(),
  ) {}

  async get(key: CredentialKey) {
    let keychainError: unknown

    try {
      const secret = await this.keychain.get(key)
      if (secret) {
        return { secret, storage: 'keychain' as const }
      }
    } catch (error) {
      keychainError = error
    }

    const secret = await this.plaintext.get(key)
    if (secret) {
      return { secret, storage: 'plaintext' as const }
    }

    if (keychainError) {
      throw keychainError
    }

    return undefined
  }
}

export function getCredentialsPath() {
  const configRoot =
    process.env.XDG_CONFIG_HOME && isAbsolute(process.env.XDG_CONFIG_HOME)
      ? process.env.XDG_CONFIG_HOME
      : join(homedir(), '.config')

  return join(configRoot, 'iron-giant', 'credentials.json')
}

function readCredentials() {
  const path = getCredentialsPath()

  if (!existsSync(path)) {
    return {} as Record<string, string>
  }

  return credentialsSchema.parse(JSON.parse(readFileSync(path, 'utf8')))
}

function keyName(key: CredentialKey) {
  return `${key.provider}:${key.providerAccountId}`
}

function keychainUnavailable(cause: unknown) {
  return new Error(
    'No OS credential store is available. Run again with --insecure-storage to save the token as plaintext.',
    { cause },
  )
}
