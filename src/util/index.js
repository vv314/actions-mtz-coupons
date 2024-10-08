import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

function readPkgJson() {
  return require('../../package.json')
}

// 对手机号脱敏处理
function replacePhoneNumber(str) {
  return str.replace(/1[3456789]\d{9}/, (match) =>
    match.replace(/^(\d{3})\d{4}(\d+)/, '$1****$2')
  )
}

function groupBy(arr, key) {
  return arr.reduce((acc, cur) => {
    const k = cur[key]

    acc[k] = acc[k] || []
    acc[k].push(cur)

    return acc
  }, {})
}

function dateFormat(date) {
  return new Date(date).toLocaleString('zh-CN', {
    hour12: false,
    timeZone: 'Asia/Shanghai'
  })
}

function maskNickName(nickName) {
  return nickName.replace(/^(.).*(.)$/, '$1***$2')
}

function removePhoneRestriction(text) {
  return text.replace(/限登录手机号为\d{3}\*\*\*\*\d{4}使用。/, '')
}

export {
  dateFormat,
  groupBy,
  readPkgJson,
  replacePhoneNumber,
  maskNickName,
  removePhoneRestriction
}
