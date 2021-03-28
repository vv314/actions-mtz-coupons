const fetch = require('node-fetch')
const querystring = require('querystring')

function doGet(url, data) {
  const search = querystring.stringify(data)

  return fetch(`${url}?${search}`, {
    timeout: 10000
  }).then(res => res.json())
}

function doPost(url, data, type = 'form') {
  let cType
  let body

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

class Notifier {
  constructor(options) {
    this.barkToken = options.barkToken
    this.serverChanToken = options.serverChanToken
    this.telegram = options.telegram
  }

  /**
   * Bark 通知
   * https://github.com/Finb/Bark
   *
   * @param  {String} title   标题
   * @param  {String} content 内容
   * @param  {String} link    链接
   * @return {Promise<String>}    推送结果
   */
  async sendBark(title = '', content = '', link = '') {
    const url = `https://api.day.app/${this.barkToken}/`
    const path = [title, content].map(encodeURIComponent).join('/')
    let data

    if (link) {
      data = { url: link }
    }

    return doGet(url + path, data)
      .then(res => 'Bark 推送成功')
      .catch(e => `Bark 推送失败: ${e}`)
  }

  /**
   * telegram bot 通知
   * https://core.telegram.org/bots/api#sendmessage
   *
   * @param  {String} title   标题
   * @param  {String} content  内容
   * @return {Promise<String>}  推送结果
   */
  async sendTelegram(title = '', content = '') {
    const { botToken, userId } = this.telegram
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    const data = { chat_id: userId, text: `【${title}】\n${content}` }

    return doPost(url, data)
      .then(res => 'Telegram 推送成功')
      .catch(e => `Telegram 推送失败: ${e}`)
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
      .then(res => 'Server 酱推送成功')
      .catch(e => `Server 酱推送失败: ${e}`)
  }

  /**
   * 聚合通知
   *
   * @param  {String} title   标题
   * @param  {String} content 内容
   * @param  {String} link    链接
   * @return {Promise<String[]>}   推送结果
   */
  async notify(title, content, link) {
    const promise = []

    if (this.barkToken) {
      promise.push(this.sendBark(title, content, link))
    }

    if (this.telegram) {
      promise.push(this.sendTelegram(title, content))
    }

    if (this.serverChanToken) {
      promise.push(this.sendServerChan(title, content))
    }

    return Promise.all(promise).then(res => res.map(t => `[Notifier] ${t}`))
  }
}

module.exports = Notifier
