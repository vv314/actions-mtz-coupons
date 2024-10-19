import tough from 'tough-cookie'
import timeoutSignal from 'timeout-signal'
import HttpsProxyAgent from 'https-proxy-agent'

const cookieJarMap = new Map()
const UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'

const ECODE = {
  FETCH: 'FETCH_ERROR',
  NETWOEK: 'NETWOEK_ERROR',
  TIMEOUT: 'TIMEOUT'
}

async function request(url, opts = {}) {
  const cookieJar = opts.cookie
  const existCookie = cookieJar?.getCookieStringSync?.(url)
  const optCookie = opts.headers?.cookie || ''
  const defHeader = {
    // 重要：需设置 UA
    'User-Agent': UA,
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

  opts.headers = { ...defHeader, ...opts.headers }

  if (opts.params) {
    Object.keys(opts.params).forEach((key) => {
      urlObj.searchParams.append(key, opts.params?.[key])
    })
  }

  delete opts.cookie
  delete opts.timeout
  delete opts.params

  if (opts.guard) {
    const { url, headers } = await opts.guard.sign(
      {
        url: urlObj,
        method: opts.method,
        body: opts.body
      },
      opts.signType
    )

    urlObj = url
    opts.headers = { ...opts.headers, ...headers }
  }

  try {
    res = await fetch(urlObj, opts)
  } catch (e) {
    if (opts.signal?.aborted) {
      throw { code: ECODE.TIMEOUT, req: urlObj, msg: e }
    }

    throw { code: ECODE.FETCH, req: urlObj, msg: res.statusText }
  }

  const setCookies = res.headers['set-cookie']

  if (setCookies) {
    setCookies.map((cookie) =>
      cookieJar?.setCookieSync(cookie, res.url, { ignoreError: true })
    )
  }

  return res
}

async function doGet(url, opts = {}) {
  const res = await request(url, {
    ...opts,
    timeout: opts.timeout ?? 10000
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

  const res = await request(url, {
    ...opts,
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

request.ECODE = ECODE
request.get = doGet
request.post = doPost
request.setProxyAgent = (url) => {
  request._proxyAgent = new HttpsProxyAgent(url)
}

export function createCookieJar(id) {
  const cookieJar = new tough.CookieJar()

  cookieJarMap.set(id, cookieJar)

  return cookieJar
}

export default request
