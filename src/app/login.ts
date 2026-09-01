export type DeviceAuthorization = {
  deviceCode: string
  userCode: string
  verificationUri: string
  expiresIn: number
  interval: number
}

export type GitAccount = {
  id: string
  username: string
}

export interface GitProvider {
  readonly name: string
  requestDeviceAuthorization(): Promise<DeviceAuthorization>
  waitForAccessToken(authorization: DeviceAuthorization): Promise<string>
  getAuthenticatedAccount(accessToken: string): Promise<GitAccount>
}

export type CredentialKey = {
  provider: string
  providerAccountId: string
}

export interface CredentialStore {
  get(key: CredentialKey): Promise<string | undefined>
  set(key: CredentialKey, secret: string): Promise<void>
}

export interface GitConnectionStore {
  upsert(input: {
    userId: string
    provider: string
    providerAccountId: string
    providerUsername: string
  }): { id: string }
}

export async function login(
  input: {
    userId: string
    provider: GitProvider
    credentials: CredentialStore
    connections: GitConnectionStore
  },
  showDeviceAuthorization: (authorization: DeviceAuthorization) => void,
) {
  const { connections, credentials, provider, userId } = input
  const authorization = await provider.requestDeviceAuthorization()
  showDeviceAuthorization(authorization)

  const accessToken = await provider.waitForAccessToken(authorization)
  const account = await provider.getAuthenticatedAccount(accessToken)
  const credentialKey = {
    provider: provider.name,
    providerAccountId: account.id,
  }

  await credentials.set(credentialKey, accessToken)
  const connection = connections.upsert({
    userId,
    provider: provider.name,
    providerAccountId: account.id,
    providerUsername: account.username,
  })

  return { account, connection }
}
