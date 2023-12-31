import { doGet } from '../util.js'

async function sendBark({ title = '', content = '', link, pushKey }) {
  const url = `https://api.day.app/${pushKey}/`
  const path = [title, content].map(encodeURIComponent).join('/')
  const icon =
    'https://github-production-user-asset-6210df.s3.amazonaws.com/7637375/291613192-73636f3d-7271-4802-b0fe-328c479c1e35.png'
  let data

  if (link) {
    data = { url: link }
  }

  return doGet(`${url}${path}?icon=${icon}`, data)
    .then((res) => ({ success: true, msg: 'Bark 推送成功' }))
    .catch((e) => ({ success: false, msg: `Bark 推送失败: ${e}` }))
}

export default sendBark
