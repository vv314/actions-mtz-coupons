process.on('unhandledRejection', (e) => {
  console.log('程序执行异常:', e)
})

import pLimit from 'p-limit'
import Notifier from './src/notifier/index.js'
import { parseToken } from './src/user.js'
import updateNotifier from './src/update-notifier.js'
import { grabCoupons } from './src/coupons/index.js'
import { maskNickName, readPkgJson } from './src/util/index.js'

const { version: currentVersion } = readPkgJson()

const TOKEN = process.env.TOKEN
const notifier = new Notifier({
  barkKey: process.env.BARK_KEY,
  larkWebhook: process.env.LARK_WEBHOOK,
  workWechat: process.env.QYWX_SEND_CONF,
  serverChanToken: process.env.SC_SEND_KEY,
  pushplusToken: process.env.PUSHPLUS_TOKEN,
  wxpusher: {
    token: process.env.WXPUSHER_TOKEN,
    topicId: process.env.WXPUSHER_TOPICID
  },
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

const NOTIFY_TITLE = '外卖神券天天领'
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
    .map(
      (item) =>
        `- ￥${item.amount} (${
          item.amountLimit ? `满${item.amountLimit}可用` : '无门槛'
        } - ${item.name})`
    )
    .join('\n')
}

function sendUserNotify({ status, message, account, userInfo }) {
  const result = []
  const userName = userInfo.nickName
  const title = `${NOTIFY_TITLE}${status == 'success' ? '😋' : '😥'}`

  if (account.barkKey) {
    const qywxRes = notifier
      .sendBark(title, message, { key: account.barkKey })
      .then((res) => `@${userName} ${res.msg}`)

    result.push(qywxRes)
  }

  if (account.qywxUid) {
    const qywxRes = notifier
      .sendWorkWechat(title, message, {
        uid: account.qywxUid
      })
      .then((res) => `@${userName} ${res.msg}`)

    result.push(qywxRes)
  }

  if (account.larkWebhook) {
    const larkRes = notifier
      .sendLark(title, message, {
        webhook: account.larkWebhook
      })
      .then((res) => `@${userName} ${res.msg}`)

    result.push(larkRes)
  }

  if (account.dtWebhook) {
    const dtRes = notifier
      .sendDingTalk(title, message, {
        webhook: account.dtWebhook
      })
      .then((res) => `@${userName} ${res.msg}`)

    result.push(dtRes)
  }

  if (account.tgUid) {
    const tgRes = notifier
      .sendTelegram(title, message, { uid: account.tgUid })
      .then((res) => `@${userName} ${res.msg}`)

    result.push(tgRes)
  }

  if (account.qq) {
    const tgRes = notifier
      .sendQmsg(title, message, { qq: account.qq })
      .then((res) => `@${userName} ${res.msg}`)

    result.push(tgRes)
  }

  return result.map((p) => p.then((r) => `[用户通知] ${r}`))
}

function sendGlobalNotify(tasks) {
  const message = tasks.map((t) => `账号 ${t.user}:\n${t.data}`).join('\n\n')
  const errorTasks = tasks.filter((t) => t.status == 'error')
  const allFailed = tasks.length && errorTasks.length === tasks.length
  const title = `${NOTIFY_TITLE}${
    allFailed
      ? '😥'
      : errorTasks.length
      ? `[${tasks.length - errorTasks.length}/${tasks.length}]`
      : '😋'
  }`

  return notifier
    .notify(title, message)
    .map((p) => p.then((res) => `[全局通知] ${res.msg}`))
}

function parseAccountName(account, userInfo = {}) {
  return account.alias || userInfo.nickName || `token${account.index}`
}

async function doJob(account, progress) {
  const res = await grabCoupons(account.token, { maxRetry: MAX_RETRY_COUNT })
  const accountName = parseAccountName(account)

  console.log(
    `\n────────── [${progress.mark()}] 账号: ${accountName} ──────────\n`
  )

  if (res.code != 0) {
    console.log(res.msg, res.error)

    res.retryTimes && console.log(`重试: ${res.retryTimes} 次`)

    console.log('\n😦 领取失败', `(v${currentVersion})`)

    return {
      status: 'error',
      user: accountName,
      data: `领取失败: ${res.msg}`,
      pushQueue: []
    }
  }

  const { coupons, userInfo } = res.data

  console.log(...coupons)
  console.log(`\n红包已放入账号：${maskNickName(userInfo.nickName)}`)
  console.log(`\n🎉 领取成功！`)

  const message = stringifyCoupons(coupons)
  const pushQueue = sendUserNotify({ message, account, userInfo })

  return {
    status: 'success',
    // 结合 userInfo 重新解析 userName
    user: parseAccountName(account, userInfo),
    data: message,
    pushQueue
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

async function printNotifyResult(pushQueue) {
  if (pushQueue.length) {
    console.log(`\n────────── 推送通知 ──────────\n`)

    // 异步打印结果
    pushQueue.forEach((p) => p.then((res) => console.log(res)))
  }

  return Promise.all(pushQueue)
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

  const globalPushQueue = sendGlobalNotify(tasks)
  const userPushQueue = tasks.map((res) => res.pushQueue).flat()
  // 打印通知结果，用户通知优先
  await printNotifyResult(userPushQueue.concat(globalPushQueue))

  checkUpdate(CHECK_UPDATE_TIMEOUT)
}

main()
