const parseToken = require('../lib/parse-token')
const { getCoupons } = require('../lib/coupons')

const TOKEN = process.env.TOKEN

async function main() {
  console.log('\n## 领取优惠券 ##')

  const tokens = parseToken(TOKEN)

  try {
    const res = await getCoupons(tokens[1].token, {
      // proxy: 'http://127.0.0.1:8887'
    })

    console.log('result', res)
  } catch (e) {
    console.log('执行失败', e)
  }
}

module.exports = main
