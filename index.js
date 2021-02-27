const getCoupons = require('./coupons')
const MAX_RETRY_COUNT = 2
let retryCount = 0

// 本地调试用
// 参考 https://github.com/motdotla/dotenv
if (process.env.LOCAL_TEST) {
  require('dotenv').config()
}

const TOKEN = process.env.TOKEN

function printResult(data) {
  console.log('—————— 活动规则 ——————\n')
  data.rule.forEach((item, index) => {
    console.log(`${++index}.`, item)
  })

  console.log('\n—————— 领取结果 ——————\n')
  data.coupons.forEach((item) => {
    console.log(item)
  })
}

async function main() {
  const result = await getCoupons(TOKEN)

  if (result.code == 0) {
    printResult(result.data)

    return console.log('\n执行成功')
  }

  if (result.code == 1) {
    return console.log('\n登录过期')
  }

  console.log('获取失败', result)

  if (retryCount++ < MAX_RETRY_COUNT) {
    console.log(`\n第 ${retryCount} 次重试`)

    return main()
  }

  console.log('\n执行失败')
}

main()
