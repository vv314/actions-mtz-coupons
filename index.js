process.on('unhandledRejection', (e) => {
  console.log('程序执行异常:', e)
})

import pLimit from 'p-limit'
import Notifier from './lib/notifier/index.js'
import parseToken from './lib/parse-token.js'
import updateNotifier from './lib/update-notifier.js'
import { getCoupons } from './lib/coupons/index.js'
import { readPkgJson } from './lib/util.js'

const { version: currentVersion } = readPkgJson()

const TOKEN = process.env.TOKEN
const notifier = new Notifier({
  barkKey: process.env.BARK_KEY,
  larkWebhook: process.env.LARK_WEBHOOK,
  workWechat: process.env.QYWX_SEND_CONF,
  serverChanToken: process.env.SC_SEND_KEY,
  pushplusToken: process.env.PUSHPLUS_TOKEN,
  dingTalkWebhook: process.env.DINGTALK_WEBHOOK,
  telegram: {
    botToken: process.env.TG_BOT_TOKEN,
    userId: process.env.TG_USER_ID
  },
  qmsg: {
    token: process.env.QMSG_KEY,
    qq: process.env.QMSG_ADMIN
  }
})

const NOTIFY_TITLE = '外卖神券天天领😋'
const MAX_RETRY_COUNT = 2
const CHECK_UPDATE_TIMEOUT = 5000

console.log(`
───────────────────────────────────────
 actions-mtwm-coupons
 外卖神券天天领
────────────────────────

 Ver. ${currentVersion}

 Github @vv314\n`)

function stringifyCoupons(coupons) {
  return coupons
    .map((item) => `- ￥${item.amount}（${item.amountLimit}）`)
    .join('\n')
}

function sendUserNotify(msg, account, userInfo) {
  const result = []
  const userName = userInfo.nickName

  if (account.barkKey) {
    const qywxRes = notifier
      .sendBark(NOTIFY_TITLE, msg, { key: account.barkKey })
      .then((res) => `@${userName} ${res.msg}`)

    result.push(qywxRes)
  }

  if (account.qywxUid) {
    const qywxRes = notifier
      .sendWorkWechat(NOTIFY_TITLE, msg, {
        uid: account.qywxUid
      })
      .then((res) => `@${userName} ${res.msg}`)

    result.push(qywxRes)
  }

  if (account.larkWebhook) {
    const larkRes = notifier
      .sendLark(NOTIFY_TITLE, msg, {
        webhook: account.larkWebhook
      })
      .then((res) => `@${userName} ${res.msg}`)

    result.push(larkRes)
  }

  if (account.dtWebhook) {
    const dtRes = notifier
      .sendDingTalk(NOTIFY_TITLE, msg, {
        webhook: account.dtWebhook
      })
      .then((res) => `@${userName} ${res.msg}`)

    result.push(dtRes)
  }

  if (account.tgUid) {
    const tgRes = notifier
      .sendTelegram(NOTIFY_TITLE, msg, { uid: account.tgUid })
      .then((res) => `@${userName} ${res.msg}`)

    result.push(tgRes)
  }

  if (account.qq) {
    const tgRes = notifier
      .sendQmsg(NOTIFY_TITLE, msg, { qq: account.qq })
      .then((res) => `@${userName} ${res.msg}`)

    result.push(tgRes)
  }

  return result.map((p) => p.then((r) => `[用户通知] ${r}`))
}

function sendGlobalNotify(tasks) {
  const message = tasks.map((t) => `账号 ${t.user}:\n${t.data}`).join('\n\n')

  return notifier
    .notify(NOTIFY_TITLE, message)
    .map((p) => p.then((res) => `[全局通知] ${res.msg}`))
}

function parseAccountName(account, user = {}) {
  return account.alias || user.nickName || `token${account.index}`
}

async function doJob(account, progress) {
  const res = await getCoupons(account.token, { maxRetry: MAX_RETRY_COUNT })
  const accountName = parseAccountName(account)

  console.log(
    `\n────────── [${progress.mark()}] 账号: ${accountName} ──────────\n`
  )

  if (res.code != 0) {
    console.log(res.msg, res.error)
    res.retryTimes && console.log(`重试: ${res.retryTimes} 次`)
    console.log('\n😦 领取失败')

    return {
      user: accountName,
      data: `领取失败: ${res.msg}`,
      userPushInfo: []
    }
  }

  const { coupons, user } = res.data

  console.log(...coupons)
  console.log(`\n红包已放入账号：${user.nickName}`)
  console.log(`\n🎉 领取成功！`)

  const message = stringifyCoupons(coupons)
  const userPushInfo = sendUserNotify(message, account, user)

  return {
    userPushInfo,
    data: message,
    // 结合 userInfo 重新解析 userName
    user: parseAccountName(account, user)
  }
}

async function runTaskQueue(tokenList) {
  const asyncPool = pLimit(5)
  const progress = {
    count: 0,
    mark() {
      return `${++this.count}/${tokenList.length}`
    }
  }

  return Promise.all(
    tokenList.map((account) => asyncPool(doJob, account, progress))
  )
}

async function printNotifyResult(pushInfo) {
  if (pushInfo.length) {
    console.log(`\n────────── 推送通知 ──────────\n`)

    // 异步打印结果
    pushInfo.forEach((p) => p.then((res) => console.log(res)))
  }

  return Promise.all(pushInfo)
}

async function checkUpdate(timeout) {
  let message

  try {
    message = await updateNotifier(timeout)
  } catch (e) {
    console.log('\n', e)
  }

  if (!message) return

  console.log(`\n────────── 更新提醒 ──────────\n`)
  console.log(message)
}

async function main() {
  const tokens = parseToken(TOKEN)

  const tasks = await runTaskQueue(tokens)

  const globalPushInfo = sendGlobalNotify(tasks)
  const userPushInfo = tasks.map((info) => info.userPushInfo).flat()

  // 打印通知结果，用户通知优先
  await printNotifyResult(userPushInfo.concat(globalPushInfo))

  checkUpdate(CHECK_UPDATE_TIMEOUT)
}

main()
