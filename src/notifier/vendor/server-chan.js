import { doPost } from '../util.js'

async function sendServerChan({ title = '', content = '', token }) {
  const api = token.includes('SCT') ? 'sctapi' : 'sc'
  const url = `https://${api}.ftqq.com/${token}.send`
  const data = { title, desp: content }

  return doPost(url, data, 'form')
    .then((res) => ({ success: true, msg: 'Server 酱推送成功' }))
    .catch((e) => ({ success: false, msg: `Server 酱推送失败: ${e}` }))
}

export default sendServerChan
