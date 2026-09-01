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
  requestDeviceAuthorization(): Promise<DeviceAuthorization>
  waitForAccessToken(authorization: DeviceAuthorization): Promise<string>
  getAuthenticatedAccount(accessToken: string): Promise<GitAccount>
}

export async function login(
  provider: GitProvider,
  showDeviceAuthorization: (authorization: DeviceAuthorization) => void,
) {
  const authorization = await provider.requestDeviceAuthorization()
  showDeviceAuthorization(authorization)

  const accessToken = await provider.waitForAccessToken(authorization)
  const account = await provider.getAuthenticatedAccount(accessToken)

  return { accessToken, account }
}
