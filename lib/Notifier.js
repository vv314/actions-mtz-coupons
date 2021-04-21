const fetch = require('node-fetch')
const querystring = require('querystring')

function doGet(url, data) {
  const search = querystring.stringify(data)

  return fetch(`${url}?${search}`, {
    timeout: 10000
  }).then(res => res.json())
}

function doPost(url, data, type = 'form') {
  let cType, body

  if (type == 'json') {
    cType = 'application/json'
    body = JSON.stringify(data)
  } else {
    cType = 'application/x-www-form-urlencoded'
    body = querystring.stringify(data)
  }

  return fetch(url, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': cType
    },
    timeout: 10000
  }).then(res => res.json())
}

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

class Notifier {
  constructor(options) {
    this.barkKey = options.barkKey
    this.serverChanToken = options.serverChanToken
    this.telegram = options.telegram
    this.workWechat = null
    this.qywxAccessToken = null

    if (options.workWechat) {
      try {
        this.workWechat = JSON.parse(options.workWechat)
      } catch (e) {
        throw new Error('企业微信配置 JSON 语法错误: ' + e)
      }
    }
  }

  async _getQywxAccessToken() {
    const { corpId, corpSecret } = this.workWechat
    const token = this.qywxAccessToken

    if (token && token.expires > Date.now()) {
      return token.value
    }

    const res = await getQywxAccessToken(corpId, corpSecret)

    this.qywxAccessToken = {
      value: res.token,
      expires: res.expires
    }

    return res.token
  }

  /**
   * Bark 通知
   * https://github.com/Finb/Bark
   *
   * @param  {String} title   标题
   * @param  {String} content 内容
   * @param  {Object} options  配置
   * @return {Promise<String>}    推送结果
   */
  async sendBark(title = '', content = '', { link, key }) {
    const barkKey = key || this.barkKey

    if (!barkKey) {
      return {
        success: false,
        msg: `Bark 推送失败: 请设置 bark key`
      }
    }

    const url = `https://api.day.app/${barkKey}/`
    const path = [title, content].map(encodeURIComponent).join('/')
    let data

    if (link) {
      data = { url: link }
    }

    return doGet(url + path, data)
      .then(res => ({ success: true, msg: 'Bark 推送成功' }))
      .catch(e => ({ success: false, msg: `Bark 推送失败: ${e}` }))
  }

  /**
   * telegram bot 通知
   * https://core.telegram.org/bots/api#sendmessage
   *
   * @param  {String} title   标题
   * @param  {String} content  内容
   * @param  {Object} options  配置
   * @return {Promise<String>}  推送结果
   */
  async sendTelegram(title = '', content = '', { uid = '' }) {
    if (!this.telegram || !this.telegram.botToken) {
      return {
        success: false,
        msg: `Telegram 推送失败: 请设置 bot token`
      }
    }

    const url = `https://api.telegram.org/bot${
      this.telegram.botToken
    }/sendMessage`
    const data = {
      chat_id: uid || this.telegram.userId,
      text: `【${title}】\n${content}`
    }

    return doPost(url, data)
      .then(res => ({ success: true, msg: 'Telegram 推送成功' }))
      .catch(e => ({ success: false, msg: `Telegram 推送失败: ${e}` }))
  }

  /**
   * Server 酱通知
   * https://sct.ftqq.com/sendkey
   *
   * @param  {String} title   标题
   * @param  {String} content  内容
   * @return {Promise<String>}  推送结果
   */
  async sendServerChan(title = '', content = '') {
    const api = this.serverChanToken.includes('SCT') ? 'sctapi' : 'sc'
    const url = `https://${api}.ftqq.com/${this.serverChanToken}.send`
    const data = { title, desp: content }

    return doPost(url, data)
      .then(res => ({ success: true, msg: 'Server 酱推送成功' }))
      .catch(e => ({ success: false, msg: `Server 酱推送失败: ${e}` }))
  }

  /**
   * 企业微信应用消息
   * https://work.weixin.qq.com/api/doc/90000/90135/90236
   *
   * @param  {String} title   标题
   * @param  {String} content  内容
   * @param  {Object} options  配置
   * @return {Promise<String>}  推送结果
   */
  async sendWorkWechat(title = '', content = '', { uid = '' }) {
    if (!this.workWechat) {
      return {
        success: false,
        msg: `企业微信推送失败: 缺少 workWechat 配置`
      }
    }

    const { agentId, toUser } = this.workWechat

    try {
      const accessToken = await this._getQywxAccessToken()
      const res = await doPost(
        `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accessToken}`,
        {
          touser: uid || toUser || '@all',
          msgtype: 'text',
          agentid: agentId,
          text: {
            content: `【${title}】\n${content}`
          }
        },
        'json'
      )

      if (res.errcode != 0) {
        throw res.errmsg
      }
    } catch (e) {
      return { success: false, msg: `企业微信推送失败: ${e}` }
    }

    return { success: true, msg: '企业微信推送成功' }
  }

  /**
   * 聚合通知
   *
   * @param  {String} title   标题
   * @param  {String} content 内容
   * @param  {Object} options  配置
   * @return {Promise<String[]>}   推送结果
   */
  notify(title, content, options = {}) {
    const result = []

    if (this.barkKey) {
      result.push(this.sendBark(title, content, options))
    }

    if (this.telegram && this.telegram.botToken) {
      result.push(this.sendTelegram(title, content, options))
    }

    if (this.workWechat) {
      result.push(this.sendWorkWechat(title, content, options))
    }

    if (this.serverChanToken) {
      result.push(this.sendServerChan(title, content, options))
    }

    return result
  }
}

module.exports = Notifier
