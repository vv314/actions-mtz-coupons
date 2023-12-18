import { doPost } from '../util.js'

async function sendPushplus({ token, title = '', content = '', qq }) {
  const url = `https://qmsg.zendee.cn/send/${token}`
  const data = {
    qq,
    msg: `【${title}】\n${content}`
  }

  return doPost(url, data, 'form')
    .then((res) => {
      if (!res.success) throw res.reason

      return { success: true, msg: 'qmsg 推送成功' }
    })
    .catch((e) => ({ success: false, msg: `qmsg 推送失败: ${e}` }))
}

export default sendPushplus
