import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'
import { init, WASI } from '@wasmer/wasi'

await init()

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const wasmBuffer = await fs.readFile(path.resolve(__dirname, './guard.wasm'))
const wasmModule = await WebAssembly.compile(wasmBuffer)

async function wbus(input) {
  const wasi = new WASI({})

  await wasi.instantiate(wasmModule, {})

  wasi.setStdinString(JSON.stringify(input))

  const exitCode = wasi.start()
  const stdout = wasi.getStdoutString()
  const result = JSON.parse(stdout)

  // console.log(`[CODE: ${exitCode}]`, result)

  return result
}

function formatUrl(url) {
  if (!url) return url

  try {
    if (typeof url === 'object' && url instanceof URL) {
      return url.toString()
    }

    url = url.trim()

    if (url.startsWith('//')) {
      return 'https:' + url
    }

    if (url.startsWith('/')) {
      return 'https://market.waimai.meituan.com' + url
    }

    return url
  } catch (jt) {
    return url
  }
}

async function genMetaData(actUrl, version) {
  const { data } = await wbus({
    method: 'genMetaData',
    args: [actUrl, version]
  })

  return data
}

async function getFingerprint(metaData, version) {
  const { data } = await wbus({
    method: 'getFingerprint',
    args: [metaData, version]
  })

  return data
}

async function getReqSig(reqOpt) {
  const { data } = await wbus({
    method: 'getReqSig',
    args: [reqOpt]
  })

  return data
}

async function getMtgSig(reqSig, guardCtx) {
  try {
    const { data } = await wbus({
      method: 'getMtgSig',
      args: [reqSig, guardCtx]
    })

    return data
  } catch (e) {
    console.log(e)
  }
}

export { formatUrl, getFingerprint, genMetaData, getMtgSig, getReqSig }
