import request, { createCookieJar } from './request.js'
import { ECODE } from './coupons/const.js'

function tokenFormat(token, index = 0) {
  const defToken = {
    token: '',
    alias: '',
    index: index + 1,
    tgUid: '',
    qywxUid: '',
    barkKey: '',
    larkWebhook: '',
    qq: ''
  }

  if (typeof token == 'string') {
    token = { token }
  }

  return Object.assign({}, defToken, token)
}

function parseToken(token) {
  if (!token) throw '请配置 TOKEN'

  const likeJson = ['{', '['].includes(token.trim()[0])

  if (!likeJson) return [tokenFormat(token)]

  try {
    token = JSON.parse(token)
  } catch (e) {
    throw `TOKEN 解析错误: ${e.message}`
  }

  return [].concat(token).map(tokenFormat)
}

async function getMTUerId() {
  const rep = await request('https://h5.waimai.meituan.com/waimai/mindex/home')

  const repCookie = rep.headers.get('set-cookie') || ''
  const matchArr = repCookie.match(/userId=(\w+)/) || []

  return matchArr[1] || ''
}

async function getUserInfo(cookie, guard) {
  const res = await request.post(
    'https://mediacps.meituan.com/gundam/gundamLogin',
    null,
    {
      cookie: cookie,
      guard: guard
    }
  )

  if (res.code == 0) return res.data

  if (res.code == 3) {
    throw { code: ECODE.AUTH, api: 'gundamLogin', msg: res.msg || res.message }
  }

  throw { code: ECODE.API, api: 'gundamLogin', msg: res.msg || res.message }
}

function createMTCookie(token) {
  const cookieJar = createCookieJar(token)
  const domain = 'Domain=.meituan.com'
  const path = 'Path=/'
  const http = 'HttpOnly'
  const expire = 'Max-Age=3600'
  const content = token.startsWith('token=') ? token : `token=${token}`
  const cookieStr = [content, domain, path, http, expire].join(';')

  cookieJar.setCookie(cookieStr, 'https://mediacps.meituan.com')

  return cookieJar
}

export { createMTCookie, getUserInfo, getMTUerId, parseToken }
