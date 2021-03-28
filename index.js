// 本地调试用
// 参考 https://github.com/motdotla/dotenv
if (process.env.LOCAL_TEST) {
  require('dotenv').config()
}

const Notifier = require('./lib/Notifier')
const getCoupons = require('./lib/coupons')

const TOKEN = process.env.TOKEN
const MAX_RETRY_COUNT = 2

const notifier = new Notifier({
  barkToken: process.env.BARK_KEY,
  serverChanToken: process.env.SC_SEND_KEY,
  telegram: {
    botToken: process.env.TG_BOT_TOKEN,
    userId: process.env.TG_USER_ID
  }
})
const notify = notifier.notify.bind(notifier, '外卖神券天天领😋')
let retryCount = 0

function printResult(data) {
  console.log('—————— 活动规则 ——————\n')
  data.rule.forEach((item, index) => {
    console.log(`${++index}.`, item)
  })

  console.log('\n—————— 领取结果 ——————\n')
  const coupons = data.coupons.map(item => {
    console.log(item)

    return `- ￥${item.amount}（${item.amountLimit}）`
  })

  console.log(`\n红包已放入账号：${data.phone}`)

  return coupons.join('\n')
}

function grabSuccess(data) {
  const link = 'https://h5.waimai.meituan.com/waimai/mindex/home'
  const text = printResult(data)

  console.log('\n🎉 执行成功！\n')

  notify(text, link).then(res => res.forEach(e => console.log(e)))
}

async function main() {
  const result = await getCoupons(TOKEN)

  if (result.code == 0) {
    return grabSuccess(result.data)
  }

  if (result.code == 1) {
    notify('登录过期', result.actUrl)

    return console.log('\n登录过期')
  }

  console.log('获取失败', result)

  if (retryCount++ < MAX_RETRY_COUNT) {
    console.log(`\n第 ${retryCount} 次重试`)

    return main()
  }

  notify('执行失败', result.actUrl)
  console.log('\n执行失败❎')
}

main()
