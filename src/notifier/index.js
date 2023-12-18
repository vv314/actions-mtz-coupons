import sendBark from './vendor/bark.js'
import sendLark from './vendor/lark.js'
import sendTelegram from './vendor/telegram.js'
import sendServerChan from './vendor/server-chan.js'
import sendPushplus from './vendor/pushplus.js'
import sendDingTalk from './vendor/dingtalk.js'
import sendQmsg from './vendor/qmsg.js'
import { sendWorkWechat, getQywxAccessToken } from './vendor/work-wechat.js'

class Notifier {
  constructor(options) {
    this.barkKey = options.barkKey
    this.larkWebhook = options.larkWebhook
    this.serverChanToken = options.serverChanToken
    this.pushplusToken = options.pushplusToken
    this.telegram = options.telegram
    this.dingTalkWebhook = options.dingTalkWebhook
    this.qmsg = options.qmsg
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

    return sendBark({ title, content, link, pushKey: barkKey })
  }

  /**
   * 飞书通知
   * https://www.feishu.cn/hc/zh-CN/articles/360040566333
   *
   * @param  {String} title   标题
   * @param  {String} content 内容
   * @param  {Object} options  配置
   * @return {Promise<String>}    推送结果
   */
  async sendLark(title = '', content = '', { webhook }) {
    const larkWebhook = webhook || this.larkWebhook

    if (!larkWebhook) {
      return {
        success: false,
        msg: `飞书推送失败: 请设置 Webhook`
      }
    }

    return sendLark({ title, content, webhook: larkWebhook })
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
    const botToken = this.telegram && this.telegram.botToken
    const user = uid || this.telegram.userId

    if (!botToken) {
      return {
        success: false,
        msg: `Telegram 推送失败: 请设置 bot token`
      }
    }

    return sendTelegram({
      botToken,
      content,
      title,
      user
    })
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
    return sendServerChan({ title, content, token: this.serverChanToken })
  }

  /**
   * pushplus 通知
   * https://www.pushplus.plus/doc/guide/api.html
   *
   * @param  {String} title   标题
   * @param  {String} content  内容
   * @return {Promise<String>}  推送结果
   */
  async sendPushplus(title = '', content = '') {
    return sendPushplus({ title, content, token: this.pushplusToken })
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

    const accessToken = await this._getQywxAccessToken()
    const { agentId, toUser } = this.workWechat
    const user = uid || toUser || '@all'

    return sendWorkWechat({
      accessToken,
      agentId,
      content,
      title,
      user
    })
  }

  /**
   * 钉钉通知
   * https://open.dingtalk.com/document/robots/custom-robot-access
   *
   * @param  {String} title   标题
   * @param  {String} content 内容
   * @param  {Object} options  配置
   * @return {Promise<String>}    推送结果
   */
  async sendDingTalk(title = '', content = '', { webhook }) {
    const dingTalkWebhook = webhook || this.dingTalkWebhook

    if (!dingTalkWebhook) {
      return {
        success: false,
        msg: `钉钉推送失败: 请设置 Webhook`
      }
    }

    return sendDingTalk({ title, content, webhook: dingTalkWebhook })
  }

  /**
   * Qmsg 酱
   * https://qmsg.zendee.cn/api.html
   *
   * @param  {String} title   标题
   * @param  {String} content 内容
   * @param  {Object} options  配置
   * @param  {String} options.qq  qq 号
   * @return {Promise<String>}    推送结果
   */
  async sendQmsg(title = '', content = '', { qq }) {
    const token = this.qmsg && this.qmsg.token
    const user = qq || this.qmsg.qq

    if (!token) {
      return {
        success: false,
        msg: `Qmsg 推送失败: 请设置 Qmsg token`
      }
    }

    return sendQmsg({
      token,
      title,
      content,
      qq: user
    })
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

    if (this.larkWebhook) {
      result.push(this.sendLark(title, content, options))
    }

    if (this.dingTalkWebhook) {
      result.push(this.sendDingTalk(title, content, options))
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

    if (this.pushplusToken) {
      result.push(this.sendPushplus(title, content, options))
    }

    if (this.qmsg && this.qmsg.token) {
      result.push(this.sendQmsg(title, content, options))
    }

    return result
  }
}

export default Notifier
