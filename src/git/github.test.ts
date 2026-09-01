import assert from 'node:assert/strict'
import { test } from 'node:test'

import { login } from '@/app/login.js'

import { GitHubProvider } from './github.js'

test('GitHub device flow authenticates and fetches the account', async () => {
  const responses = [
    Response.json({
      device_code: 'device-code',
      user_code: 'ABCD-1234',
      verification_uri: 'https://github.com/login/device',
      expires_in: 900,
      interval: 5,
    }),
    Response.json({ error: 'authorization_pending' }),
    Response.json({
      access_token: 'secret-token',
      token_type: 'bearer',
      scope: 'repo,read:user',
    }),
    Response.json({ id: 123, login: 'octocat' }),
  ]
  const requests: Array<{ url: string; init: RequestInit | undefined }> = []
  const sleeps: number[] = []

  const provider = new GitHubProvider({
    clientId: 'client-id',
    request: async (input, init) => {
      requests.push({ url: input.toString(), init })
      const response = responses.shift()
      assert.ok(response)
      return response
    },
    sleep: async (milliseconds) => {
      sleeps.push(milliseconds)
    },
    now: () => 0,
  })

  let shownCode: string | undefined
  const result = await login(provider, (authorization) => {
    shownCode = authorization.userCode
  })

  assert.equal(shownCode, 'ABCD-1234')
  assert.deepEqual(sleeps, [5000, 5000])
  assert.deepEqual(
    requests.map(({ url }) => url),
    [
      'https://github.com/login/device/code',
      'https://github.com/login/oauth/access_token',
      'https://github.com/login/oauth/access_token',
      'https://api.github.com/user',
    ],
  )
  assert.deepEqual(result, {
    accessToken: 'secret-token',
    account: { id: '123', username: 'octocat' },
  })
})

test('GitHub device flow reports authorization denial', async () => {
  const provider = new GitHubProvider({
    clientId: 'client-id',
    request: async () =>
      Response.json({
        error: 'access_denied',
      }),
    sleep: async () => {},
    now: () => 0,
  })

  await assert.rejects(
    provider.waitForAccessToken({
      deviceCode: 'device-code',
      userCode: 'ABCD-1234',
      verificationUri: 'https://github.com/login/device',
      expiresIn: 900,
      interval: 5,
    }),
    /GitHub authorization was denied/,
  )
})
