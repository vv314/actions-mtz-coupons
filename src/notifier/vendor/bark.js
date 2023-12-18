import { doGet } from '../util.js'

async function sendBark({ title = '', content = '', link, pushKey }) {
  const url = `https://api.day.app/${pushKey}/`
  const path = [title, content].map(encodeURIComponent).join('/')
  let data

  if (link) {
    data = { url: link }
  }

  return doGet(url + path, data)
    .then((res) => ({ success: true, msg: 'Bark 推送成功' }))
    .catch((e) => ({ success: false, msg: `Bark 推送失败: ${e}` }))
}

export default sendBark
