import { doPost } from '../util.js'

async function sendLark({ title = '', content = '', webhook }) {
  const data = {
    mtz: {
      title,
      content
    }
  }

  return doPost(webhook, data)
    .then((res) => {
      if (res.code) throw res.msg
    })
    .then(() => ({ success: true, msg: '飞书推送成功' }))
    .catch((e) => ({ success: false, msg: `飞书推送失败: ${e}` }))
}

export default sendLark
