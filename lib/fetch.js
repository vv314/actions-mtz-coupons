const nodeFetch = require('node-fetch')
const tough = require('tough-cookie')
const HttpsProxyAgent = require('https-proxy-agent')

const ECODE = {
  FETCH: 'FETCH_ERROR',
  NETWOEK: 'NETWOEK_ERROR'
}
const cookieJar = new tough.CookieJar()

async function fetch(url, opts = {}) {
  const cookie = cookieJar.getCookieStringSync(url)
  const optCookie = opts.headers?.cookie || ''
  const defHeader = {
    Connection: 'keep-alive'
  }

  if (cookie) {
    defHeader.cookie = cookie + ';' + optCookie
  }

  opts.headers = Object.assign({}, defHeader, opts.headers)

  if (fetch._proxyAgent) {
    opts.agent = fetch._proxyAgent
  }

  const res = await nodeFetch(url, opts)
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

  try {
    res = await fetch(`${url}?${params.toString()}`, {
      headers,
      timeout: 10000
    })
  } catch (e) {
    throw { code: ECODE.NETWOEK, url: url, msg: e }
  }

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

  let res

  try {
    res = await fetch(url, {
      method: 'POST',
      body: body,
      headers: Object.assign({}, opts.headers, {
        'Content-Type': cType
      }),
      timeout: 10000
    })
  } catch (e) {
    throw { code: ECODE.NETWOEK, url: url, msg: e }
  }

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

module.exports = fetch
