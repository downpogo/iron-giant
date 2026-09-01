import { Template } from 'e2b'

export const nodeVersion = '24.14.0'
export const openCodeVersion = '1.18.25'

export const template = Template()
  .fromNodeImage(`${nodeVersion}-bookworm`)
  .aptInstall(['ca-certificates', 'git'])
  .npmInstall(`opencode-ai@${openCodeVersion}`, { g: true })
  .runCmd([
    `test "$(node --version)" = "v${nodeVersion}"`,
    'git --version',
    `test "$(opencode --version)" = "${openCodeVersion}"`,
  ])
