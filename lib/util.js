import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

function readPkgJson() {
  return require('../package.json')
}

// 对手机号脱敏处理
function replacePhoneNumber(str) {
  return str.replace(/1[3456789]\d{9}/, (match) =>
    match.replace(/^(\d{3})\d{4}(\d+)/, '$1****$2')
  )
}

export { readPkgJson, replacePhoneNumber }
