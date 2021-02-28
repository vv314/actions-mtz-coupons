const fetch = require('node-fetch')

const BARK_KEY = process.env.BARK_KEY

function barkPush(title, content, link) {
  const api = `https://api.day.app/${BARK_KEY}/`
  let param = [title, content].map(encodeURIComponent).join('/')

  if (link) {
    param += `?url=${encodeURIComponent(link)}`
  }

  fetch(api + param)
}

function notify(title, content, link) {
  barkPush(title, content, link)
}

module.exports = notify
