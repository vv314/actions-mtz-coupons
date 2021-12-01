const { doPost } = require('../util')

async function sendPushplus({ title = '', content = '', token }) {
  const url = `http://www.pushplus.plus/send`
  const data = { token, title, content: content, template: 'txt' }

  return doPost(url, data)
    .then((res) => ({ success: true, msg: 'pushplus 推送成功' }))
    .catch((e) => ({ success: false, msg: `pushplus 推送失败: ${e}` }))
}

module.exports = sendPushplus
