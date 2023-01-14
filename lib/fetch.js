import nodeFetch from 'node-fetch'
import tough from 'tough-cookie'
import timeoutSignal from 'timeout-signal'
import HttpsProxyAgent from 'https-proxy-agent'

const ECODE = {
  FETCH: 'FETCH_ERROR',
  NETWOEK: 'NETWOEK_ERROR',
  TIMEOUT: 'TIMEOUT'
}
const cookieJar = new tough.CookieJar()

async function fetch(url, opts = {}) {
  const cookie = cookieJar.getCookieStringSync(url)
  const optCookie = opts.headers?.cookie || ''
  const defHeader = {
    // 重要：需设置 UA
    'User-Agent':
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1',
    Connection: 'keep-alive'
  }
  let res

  if (opts.timeout) {
    opts.signal = timeoutSignal(opts.timeout)
    delete opts.timeout
  }

  if (cookie) {
    defHeader.cookie = cookie + ';' + optCookie
  }

  opts.headers = Object.assign({}, defHeader, opts.headers)

  if (fetch._proxyAgent) {
    opts.agent = fetch._proxyAgent
  }

  try {
    res = await nodeFetch(url, opts)
  } catch (e) {
    if (opts.signal?.aborted) {
      throw { code: ECODE.TIMEOUT, url: url, msg: e }
    }

    throw { code: ECODE.FETCH, url: url, msg: res.statusText }
  }

  const setCookies = res.headers.raw()['set-cookie']

  if (setCookies) {
    repCookies.map((cookie) =>
      cookieJar.setCookieSync(cookie, res.url, { ignoreError })
    )
  }

  return res
}

async function doGet(url, opts = {}) {
  const params = new URLSearchParams(opts.params)
  const headers = opts.headers

  const res = await fetch(`${url}?${params.toString()}`, {
    headers,
    timeout: opts.timeout ?? 10000
  })

  if (res.ok) return res.json()

  throw { code: ECODE.FETCH, url: url, msg: res.statusText }
}

async function doPost(url, data, opts = {}) {
  const payloadType = opts.type
  let cType, body

  if (payloadType == 'form') {
    const params = new URLSearchParams(data)

    cType = 'application/x-www-form-urlencoded'
    body = params.toString()
  } else {
    cType = 'application/json'
    body = data ? JSON.stringify(data) : ''
  }

  const res = await fetch(url, {
    method: 'POST',
    body: body,
    headers: Object.assign({}, opts.headers, {
      'Content-Type': cType
    }),
    timeout: opts.timeout ?? 10000
  })

  if (res.ok) return res.json()

  throw { code: ECODE.FETCH, url: url, msg: res.statusText }
}

fetch.ECODE = ECODE
fetch.get = doGet
fetch.post = doPost
fetch.cookieJar = cookieJar
fetch.setProxyAgent = (url) => {
  fetch._proxyAgent = new HttpsProxyAgent(url)
}

export default fetch
