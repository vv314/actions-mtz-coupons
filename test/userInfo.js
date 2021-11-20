const fetch = require('node-fetch')
const parseToken = require('../lib/parse-token')

const TOKEN = process.env.TOKEN
const tokens = parseToken(TOKEN)

function genCookie(token) {
  return token.startsWith('token=') ? token : `token=${token}`
}

async function getUserInfo(token) {
  const cookie = genCookie(token)

  return fetch('https://mediacps.meituan.com/gundam/gundamLogin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1',
      cookie: cookie
    },
    timeout: 10000
  }).then((rep) => rep.json())
}

async function main() {
  console.log('\n## 获取用户信息 ##')

  const res = await Promise.all(tokens.map((t) => getUserInfo(t.token)))

  console.log('users', res)
}

module.exports = main
