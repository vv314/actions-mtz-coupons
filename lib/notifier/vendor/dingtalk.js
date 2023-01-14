import crypto from 'node:crypto'
import { doPost } from '../util.js'

function signFn(secret, content) {
  const str = crypto
    .createHmac('sha256', secret)
    .update(content)
    .digest()
    .toString('base64')

  return encodeURIComponent(str)
}

async function sendDingTalk({ title = '', content = '', webhook }) {
  const timestamp = Date.now()
  let secret = ''

  if (webhook.startsWith('SEC')) {
    const [sec, url] = webhook.split('|')

    secret = sec
    webhook = url
  }

  const sign = signFn(secret, `${timestamp}\n${secret}`)
  const hookUrl = `${webhook}&timestamp=${timestamp}&sign=${sign}`
  const data = {
    msgtype: 'text',
    text: {
      content: `【${title}】\n${content}`
    }
  }

  return doPost(hookUrl, data)
    .then((res) => {
      if (res.errcode == 0) return

      if (res.errcode == 310000) {
        throw 'secret 不匹配'
      } else if (res.errcode == 300001) {
        throw 'access_token 不匹配'
      } else {
        throw res.errmsg
      }
    })
    .then(() => ({ success: true, msg: '钉钉推送成功' }))
    .catch((e) => ({ success: false, msg: `钉钉推送失败: ${e}` }))
}

export default sendDingTalk
