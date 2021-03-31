// 本地调试用
// 参考 https://github.com/motdotla/dotenv
if (process.env.LOCAL_TEST) {
  require('dotenv').config()
}

const Notifier = require('./lib/Notifier')
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
let notifyResult = []

function tokenFormat(token) {
  const defToken = {
    token: '',
    name: '',
    tgUid: '',
    qywxUid: '',
    barkKey: ''
  }

  if (typeof token == 'string') {
    token = { token }
  }

  return Object.assign({}, defToken, token)
}

function parseToken(token) {
  const likeArray = /^\[.*\]$/.test(token)
  const likeObject = /^\{.*\}$/.test(token)
  let tokenList = []

  if (!likeArray && !likeObject) {
    return [tokenFormat(token)]
  }

  try {
    tokenList = tokenList.concat(JSON.parse(token))
  } catch (e) {
    throw new Error('JSON 格式有误' + e)
  }

  return tokenList.map(tokenFormat)
}

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

function stringifyTasks(tasks) {
  return tasks.map(res => `账户 ${res.account}:\n${res.text}`).join('\n\n')
}

function sendTaskNotify(msg, account) {
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

  return Promise.all(result).then(arr => arr.map(res => `[用户通知] ${res}`))
}

async function runTask(account) {
  const result = await getCoupons(account.token)
  const { code, data, msg } = result

  if (code == 0) {
    console.log(...data.coupons)
    console.log(`\n红包已放入账号：${data.phone}`)
    console.log(`\n🎉 领取成功！`)

    const text = stringifyCoupons(data.coupons)
    const pushRes = sendTaskNotify(text, account)

    notifyResult.push(pushRes)

    return { account: data.phone, text }
  }

  const errMsg = `领取失败: ${msg}`

  console.log('😦', errMsg)
  notify(errMsg, { link: data.actUrl })

  return errMsg
}

async function main() {
  const tokenList = parseToken(TOKEN)
  const rule = await getRule()

  console.log('—————————— 活动规则 ——————————\n')
  rule.forEach((item, i) => {
    console.log(`${i + 1}. ${item}`)
  })

  const total = tokenList.length
  const tasks = []

  for (let i = 0; i < total; i++) {
    console.log(`\n—————————— 第 ${i + 1}/${total} 账户 ——————————\n`)
    tasks.push(await runTask(tokenList[i]))
  }

  // just new line
  console.log()

  const text = stringifyTasks(tasks)
  const pushRes = notify(text).then(arr =>
    arr.map(res => `[全局通知] ${res.msg}`)
  )

  notifyResult.push(pushRes)

  for await (let res of notifyResult) {
    res.forEach(e => console.log(e))
  }
}

main()
