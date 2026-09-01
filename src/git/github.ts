import { z } from 'zod'

import type {
  DeviceAuthorization,
  GitAccount,
  GitProvider,
} from '@/app/login.js'
import type { RepositoryMetadata, RepositoryProvider } from '@/app/repo.js'

const deviceAuthorizationSchema = z.object({
  device_code: z.string(),
  user_code: z.string(),
  verification_uri: z.url(),
  expires_in: z.number().int().positive(),
  interval: z.number().int().positive(),
})

const tokenResponseSchema = z.union([
  z.object({
    access_token: z.string(),
  }),
  z.object({
    error: z.string(),
    error_description: z.string().optional(),
    interval: z.number().int().positive().optional(),
  }),
])

const accountSchema = z.object({
  id: z.number().int().nonnegative(),
  login: z.string(),
})

const repositorySchema = z.object({
  id: z.number().int().nonnegative(),
  owner: z.object({ login: z.string() }),
  name: z.string(),
  clone_url: z.url(),
})

type Request = (input: string | URL, init?: RequestInit) => Promise<Response>

type GitHubProviderOptions = {
  clientId: string
  request?: Request
  sleep?: (milliseconds: number) => Promise<void>
  now?: () => number
}

export class GitHubProvider implements GitProvider, RepositoryProvider {
  readonly name = 'github'

  private readonly clientId: string
  private readonly request: Request
  private readonly sleep: (milliseconds: number) => Promise<void>
  private readonly now: () => number

  constructor({
    clientId,
    request = fetch,
    sleep = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
    now = Date.now,
  }: GitHubProviderOptions) {
    this.clientId = clientId
    this.request = request
    this.sleep = sleep
    this.now = now
  }

  async requestDeviceAuthorization(): Promise<DeviceAuthorization> {
    const response = await this.request(
      'https://github.com/login/device/code',
      {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/x-www-form-urlencoded',
          'user-agent': 'iron-giant',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          scope: 'repo read:user',
        }),
      },
    )

    await assertSuccessful(response, 'GitHub device authorization')
    const authorization = deviceAuthorizationSchema.parse(await response.json())

    return {
      deviceCode: authorization.device_code,
      userCode: authorization.user_code,
      verificationUri: authorization.verification_uri,
      expiresIn: authorization.expires_in,
      interval: authorization.interval,
    }
  }

  async waitForAccessToken(authorization: DeviceAuthorization) {
    const expiresAt = this.now() + authorization.expiresIn * 1000
    let interval = authorization.interval * 1000

    while (this.now() < expiresAt) {
      await this.sleep(interval)

      const response = await this.request(
        'https://github.com/login/oauth/access_token',
        {
          method: 'POST',
          headers: {
            accept: 'application/json',
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': 'iron-giant',
          },
          body: new URLSearchParams({
            client_id: this.clientId,
            device_code: authorization.deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          }),
        },
      )

      await assertSuccessful(response, 'GitHub access token request')
      const token = tokenResponseSchema.parse(await response.json())

      if ('access_token' in token) {
        return token.access_token
      }

      if (token.error === 'authorization_pending') {
        continue
      }

      if (token.error === 'slow_down') {
        interval = token.interval ? token.interval * 1000 : interval + 5000
        continue
      }

      throw new Error(
        token.error_description ?? githubErrorMessage(token.error),
      )
    }

    throw new Error('GitHub device authorization expired')
  }

  async getAuthenticatedAccount(accessToken: string): Promise<GitAccount> {
    const response = await this.request('https://api.github.com/user', {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${accessToken}`,
        'user-agent': 'iron-giant',
        'x-github-api-version': '2026-03-10',
      },
    })

    await assertSuccessful(response, 'GitHub account request')
    const account = accountSchema.parse(await response.json())

    return {
      id: String(account.id),
      username: account.login,
    }
  }

  async getRepository(
    repositoryUrl: string,
    accessToken: string,
  ): Promise<RepositoryMetadata> {
    const { owner, repository } = parseGitHubRepositoryUrl(repositoryUrl)
    const response = await this.request(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`,
      {
        headers: {
          accept: 'application/vnd.github+json',
          authorization: `Bearer ${accessToken}`,
          'user-agent': 'iron-giant',
          'x-github-api-version': '2026-03-10',
        },
      },
    )

    if (response.status === 404) {
      await response.body?.cancel()
      throw new Error('GitHub repository was not found or is not accessible')
    }

    await assertSuccessful(response, 'GitHub repository request')
    const metadata = repositorySchema.parse(await response.json())

    return {
      providerRepositoryId: String(metadata.id),
      owner: metadata.owner.login,
      name: metadata.name,
      cloneUrl: metadata.clone_url,
    }
  }
}

function parseGitHubRepositoryUrl(repositoryUrl: string) {
  let url: URL

  try {
    url = new URL(repositoryUrl)
  } catch {
    throw new Error('Repository URL must be a valid GitHub HTTPS URL')
  }

  if (
    url.protocol !== 'https:' ||
    url.hostname.toLowerCase() !== 'github.com' ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash
  ) {
    throw new Error('Repository URL must be a valid GitHub HTTPS URL')
  }

  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length !== 2) {
    throw new Error(
      'Repository URL must identify a GitHub owner and repository',
    )
  }

  const owner = parts[0]
  const repository = parts[1]?.replace(/\.git$/, '')
  if (!owner || !repository) {
    throw new Error(
      'Repository URL must identify a GitHub owner and repository',
    )
  }

  return { owner, repository }
}

async function assertSuccessful(response: Response, operation: string) {
  if (!response.ok) {
    await response.body?.cancel()
    throw new Error(`${operation} failed with status ${response.status}`)
  }
}

function githubErrorMessage(error: string) {
  const messages: Record<string, string> = {
    access_denied: 'GitHub authorization was denied',
    device_flow_disabled:
      'GitHub Device Flow is not enabled for this OAuth app',
    expired_token: 'GitHub device authorization expired',
    incorrect_client_credentials: 'GitHub OAuth client ID is invalid',
    incorrect_device_code: 'GitHub device code is invalid',
  }

  return messages[error] ?? `GitHub authorization failed: ${error}`
}
