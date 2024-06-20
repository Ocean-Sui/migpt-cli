import childProcess, { type ChildProcess } from 'node:child_process'
import * as path from 'node:path'
import { type MiGPTConfig } from 'mi-gpt'

export interface RunConfig {
  /**
   * 运行 MiGPT 所需的环境变量
   * @see https://github.com/idootop/mi-gpt/blob/main/docs/settings.md#%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F
   */
  env: {
    OPENAI_API_KEY: string
    OPENAI_MODEL: string
    OPENAI_BASE_URL?: string
    AZURE_OPENAI_API_KEY?: string
    AUDIO_SILENT?: string
    AUDIO_BEEP?: string
    AUDIO_ACTIVE?: string
    AUDIO_ERROR?: string
    TTS_BASE_URL?: string
  }
  /**
   * MiGPT 的配置
   * @see https://github.com/idootop/mi-gpt/blob/main/docs/settings.md#migptjs
   */
  config: MiGPTConfig
}

let child: ChildProcess | undefined

function killChild() {
  return new Promise<void>((resolve) => {
    if (child) {
      child.once('exit', () => {
        resolve()
      })
      child.send({ type: 'destroy' })
      child = undefined
    } else {
      resolve()
    }
  })
}

export async function run(config: RunConfig) {
  await killChild()
  child = childProcess.fork(path.join(__dirname, './child.js'), {
    env: config.env,
  })
  child.send({ type: 'run', config: config.config })
}

export async function stop() {
  await killChild()
}

export function getStatus() {
  return {
    running: !!child,
  }
}
