const getCoupons = require('./coupons')

// 本地调试用
// 参考 https://github.com/motdotla/dotenv
if (process.env.LOCAL_TEST) {
  require('dotenv').config()
}

const TOKEN = process.env.TOKEN

async function main() {
  const result = await getCoupons(TOKEN)

  console.log(result)
}

main()
