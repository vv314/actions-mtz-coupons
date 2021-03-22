const fetch = require('node-fetch')

const BARK_KEY = process.env.BARK_KEY
const TG_USER_ID = process.env.TG_USER_ID
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN

function barkPush(title, content, link) {
  const api = `https://api.day.app/${BARK_KEY}/`
  let param = [title, content].map(encodeURIComponent).join('/')

  if (link) {
    param += `?url=${encodeURIComponent(link)}`
  }

  return fetch(api + param, { timeout: 10000 })
}

function telegramPush(title, content) {
  const msg = `${title}\n\n${content}`
  const api = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`
  const search = `?chat_id=${TG_USER_ID}&text=${encodeURIComponent(msg)}`

  return fetch(api + search, { timeout: 10000 })
}

async function notify(title, content, link) {
  if (BARK_KEY) {
    barkPush(title, content, link)
  }

  if (TG_USER_ID && TG_BOT_TOKEN) {
    telegramPush(title, content)
  }
}

module.exports = notify
