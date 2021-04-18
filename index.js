// 本地调试用
// 参考 https://github.com/motdotla/dotenv
if (process.env.LOCAL_TEST) {
  require('dotenv').config()
}

const Notifier = require('./lib/Notifier')
const parseToken = require('./lib/parse-token')
const updateNotifier = require('./lib/update-notifier')
const { getCoupons, getRule } = require('./lib/coupons')

const TOKEN = process.env.TOKEN
const notifier = new Notifier({
  barkKey: process.env.BARK_KEY,
  workWechat: process.env.QYWX_SEND_CONF,
  serverChanToken: process.env.SC_SEND_KEY,
  telegram: {
    botToken: process.env.TG_BOT_TOKEN,
    userId: process.env.TG_USER_ID
  }
})
const notifyTitle = '外卖神券天天领😋'
const notify = notifier.notify.bind(notifier, notifyTitle)
let userNotifyResult = []

function printResult(data) {
  console.log('\n—————— 领取结果 ——————\n')
  const coupons = data.coupons.map(item => {
    console.log(item)

    return `- ￥${item.amount}（${item.amountLimit}）`
  })

  console.log(`\n红包已放入账号：${data.phone}`)

  return coupons.join('\n')
}

function stringifyCoupons(coupons) {
  return coupons
    .map(item => `- ￥${item.amount}（${item.amountLimit}）`)
    .join('\n')
}

function sendUserNotify(msg, account) {
  const result = []

  if (account.barkKey) {
    const qywxRes = notifier
      .sendBark(notifyTitle, msg, { key: account.barkKey })
      .then(res => `@${account.barkKey.slice(0, 5)} ${res.msg}`)

    result.push(qywxRes)
  }

  if (account.qywxUid) {
    const qywxRes = notifier
      .sendWorkWechat(notifyTitle, msg, {
        uid: account.qywxUid
      })
      .then(res => `@${account.qywxUid} ${res.msg}`)

    result.push(qywxRes)
  }

  if (account.tgUid) {
    const tgRes = notifier
      .sendTelegram(notifyTitle, msg, { uid: account.tgUid })
      .then(res => `@${account.tgUid} ${res.msg}`)

    result.push(tgRes)
  }

  return result.map(p => p.then(r => `[用户通知] ${r}`))
}

async function runTask(account) {
  const result = await getCoupons(account.token)
  const { code, data, msg } = result

  if (code == 0) {
    console.log(...data.coupons)
    console.log(`\n红包已放入账号：${data.phone}`)
    console.log(`\n🎉 领取成功！`)

    const text = stringifyCoupons(data.coupons)
    const pushRes = sendUserNotify(text, account)

    userNotifyResult = userNotifyResult.concat(pushRes)

    return { account: data.phone, text }
  }

  const errMsg = `领取失败: ${msg}`

  console.log('😦', errMsg)
  notify(errMsg, { link: data.actUrl })

  return errMsg
}

async function printRule() {
  const rule = await getRule()

  if (rule.length) {
    console.log('—————————— 活动规则 ——————————\n')
    rule.forEach((item, i) => {
      console.log(`${i + 1}. ${item}`)
    })
  }
}

async function runTaskList(tokenList) {
  const total = tokenList.length
  const result = []

  for (let i = 0; i < total; i++) {
    console.log(`\n—————————— 第 ${i + 1}/${total} 账户 ——————————\n`)
    result.push(await runTask(tokenList[i]))
  }

  return result
}

function sendNotify(tasks) {
  const message = tasks
    .map(res => `账户 ${res.account}:\n${res.text}`)
    .join('\n\n')

  return notify(message).map(p => p.then(res => `[全局通知] ${res.msg}`))
}

async function printNotifyResult(pushRes) {
  const notifyResult = [].concat(userNotifyResult, pushRes)

  if (notifyResult.length) {
    console.log(`\n—————————— 推送通知 ——————————\n`)

    // 异步打印结果
    notifyResult.forEach(p => p.then(res => console.log(res)))
  }

  return Promise.all(notifyResult)
}

async function checkUpdate() {
  const message = await updateNotifier()

  if (!message) return

  console.log(`\n—————————— 更新提醒 ——————————\n`)
  console.log(message)
}

async function main() {
  await printRule()

  const tokens = parseToken(TOKEN)
  const tasks = await runTaskList(tokens)

  // just new line
  console.log()

  const pushRes = sendNotify(tasks)

  await printNotifyResult(pushRes)

  checkUpdate()
}

main()
