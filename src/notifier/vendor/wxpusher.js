import { doPost } from '../util.js'

async function sendWxPusher({ title = '', content = '', token, topicId }) {
  const url = `https://wxpusher.zjiecode.com/api/send/message`
  const data = {
    appToken: token,
    content: content,
    summary: title,
    contentType: 1,
    topicIds: [topicId + '']
  }

  return doPost(url, data)
    .then((res) => {
      return res
    })
    .catch((e) => ({ success: false, msg: `wxpusher 推送失败: ${e}` }))
}

export default sendWxPusher
