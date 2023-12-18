import { doPost } from '../util.js'

async function sendPushplus({ title = '', content = '', token }) {
  const url = `https://www.pushplus.plus/send`
  const data = { token, title, content: content, template: 'txt' }

  return doPost(url, data)
    .then((res) => {
      if (res.code != 200) throw res.msg

      return { success: true, msg: 'pushplus 推送成功' }
    })
    .catch((e) => ({ success: false, msg: `pushplus 推送失败: ${e}` }))
}

export default sendPushplus
