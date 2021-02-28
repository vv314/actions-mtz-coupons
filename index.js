// 本地调试用
// 参考 https://github.com/motdotla/dotenv
if (process.env.LOCAL_TEST) {
  require('dotenv').config()
}

const getCoupons = require('./coupons')
const notify = require('./notify').bind(null, '外卖神券天天领😋')

const MAX_RETRY_COUNT = 2
let retryCount = 0

const TOKEN = process.env.TOKEN

function printResult(data) {
  console.log('—————— 活动规则 ——————\n')
  data.rule.forEach((item, index) => {
    console.log(`${++index}.`, item)
  })

  console.log('\n—————— 领取结果 ——————\n')
  const coupons = data.coupons.map((item) => {
    console.log(item)

    return `- ￥${item.amount}（${item.amountLimit}）`
  })

  console.log(`\n红包已放入账号：${data.phone}`)

  return coupons.join('\n')
}

async function main() {
  const result = await getCoupons(TOKEN)

  if (result.code == 0) {
    const text = printResult(result.data)

    notify(text, 'https://h5.waimai.meituan.com/waimai/mindex/home')

    return console.log('\n执行成功✅')
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
