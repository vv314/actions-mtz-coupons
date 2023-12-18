import { doGet, doPost } from '../util.js'

/**
 * 获取企业微信 accessToken
 * https://work.weixin.qq.com/api/doc/90000/90135/91039
 *
 * @param  {[type]} corpId     企业 id
 * @param  {[type]} corpSecret 企业应用密匙
 * @return {Promise<Object>}   结果
 */
async function getQywxAccessToken(corpId, corpSecret) {
  const res = await doGet('https://qyapi.weixin.qq.com/cgi-bin/gettoken', {
    corpid: corpId,
    corpsecret: corpSecret
  })

  if (res.errcode != 0) {
    throw new Error('AccessToken 获取失败：' + res.errmsg)
  }

  // 提前十分钟过期
  const expiresTime = Date.now() + res.expires_in * 1000 - 10 * 60 * 1000

  return {
    token: res.access_token,
    expires: expiresTime
  }
}

async function sendWorkWechat({
  title = '',
  content = '',
  accessToken,
  agentId,
  user
}) {
  try {
    const res = await doPost(
      `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accessToken}`,
      {
        touser: user,
        msgtype: 'text',
        agentid: agentId,
        text: {
          content: `【${title}】\n${content}`
        }
      }
    )

    if (res.errcode != 0) {
      throw res.errmsg
    }
  } catch (e) {
    return { success: false, msg: `企业微信推送失败: ${e}` }
  }

  return { success: true, msg: '企业微信推送成功' }
}

export { sendWorkWechat, getQywxAccessToken }
