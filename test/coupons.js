const parseToken = require('../lib/parse-token')
const { getCoupons } = require('../lib/coupons')

const TOKEN = process.env.TOKEN

async function main() {
  console.log('\n## 领取优惠券 ##')

  const tokens = parseToken(TOKEN)

  try {
    const res = await getCoupons(tokens[0].token)

    console.log('result', res)
  } catch (e) {
    console.log('执行失败', e)
  }
}

module.exports = main
