import nodeFetch from 'node-fetch'
import tough from 'tough-cookie'
import timeoutSignal from 'timeout-signal'
import HttpsProxyAgent from 'https-proxy-agent'

const cookieJarMap = new Map()

const ECODE = {
  FETCH: 'FETCH_ERROR',
  NETWOEK: 'NETWOEK_ERROR',
  TIMEOUT: 'TIMEOUT'
}

async function fetch(url, opts = {}) {
  const cookieJar = opts.cookie
  const guard = opts.guard
  const existCookie = cookieJar?.getCookieStringSync?.(url)
  const optCookie = opts.headers?.cookie || ''
  const defHeader = {
    // 重要：需设置 UA
    'User-Agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    Connection: 'keep-alive'
  }
  let urlObj = new URL(url)
  let res

  if (opts.timeout) {
    opts.signal = timeoutSignal(opts.timeout)
  }

  if (existCookie) {
    defHeader.cookie = existCookie + ';' + optCookie
  }

  if (fetch._proxyAgent) {
    opts.agent = fetch._proxyAgent
  } else if (opts.proxy) {
    opts.agent = new HttpsProxyAgent(opts.proxy)
  }

  opts.headers = Object.assign({}, defHeader, opts.headers)

  if (opts.params) {
    Object.keys(opts.params).forEach((key) => {
      urlObj.searchParams.append(key, opts.params?.[key])
    })
  }

  delete opts.cookie
  delete opts.timeout
  delete opts.params

  if (guard) {
    urlObj = await guard.sign({
      url: urlObj,
      method: opts.method,
      body: opts.body
    })
  }

  try {
    res = await nodeFetch(urlObj, opts)
  } catch (e) {
    if (opts.signal?.aborted) {
      throw { code: ECODE.TIMEOUT, req: urlObj, msg: e }
    }

    throw { code: ECODE.FETCH, req: urlObj, msg: res.statusText }
  }

  const setCookies = res.headers.raw()['set-cookie']

  if (setCookies) {
    setCookies.map((cookie) =>
      cookieJar?.setCookieSync(cookie, res.url, { ignoreError: true })
    )
  }

  return res
}

async function doGet(url, opts = {}) {
  const res = await fetch(url, {
    headers: opts.headers,
    cookie: opts.cookie,
    params: opts.params,
    timeout: opts.timeout ?? 10000,
    guard: opts.guard
  })

  if (res.ok) return res.json()

  throw { code: ECODE.FETCH, url: url, msg: res.statusText }
}

async function doPost(url, data, opts = {}) {
  const payloadType = opts.type
  let cType, body

  if (payloadType == 'form') {
    const formData = new URLSearchParams(data)

    cType = 'application/x-www-form-urlencoded'
    body = formData.toString()
  } else {
    cType = 'application/json'
    body = data ? JSON.stringify(data) : ''
  }

  const res = await fetch(url, {
    method: 'POST',
    body: body,
    cookie: opts.cookie,
    params: opts.params,
    headers: Object.assign({}, opts.headers, {
      'Content-Type': cType
    }),
    timeout: opts.timeout ?? 10000,
    guard: opts.guard
  })

  if (res.ok) return res.json()

  throw { code: ECODE.FETCH, url: url, msg: res.statusText }
}

fetch.ECODE = ECODE
fetch.get = doGet
fetch.post = doPost
fetch.setProxyAgent = (url) => {
  fetch._proxyAgent = new HttpsProxyAgent(url)
}

export function createCookieJar(id) {
  const cookieJar = new tough.CookieJar()

  cookieJarMap.set(id, cookieJar)

  return cookieJar
}

export default fetch
