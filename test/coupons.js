const parseToken = require('../lib/parse-token')
const { getRule, getCoupons } = require('../lib/coupons')

const TOKEN = process.env.TOKEN

async function main() {
  const tokens = parseToken(TOKEN)
  const res = await getCoupons(tokens[0].token)

  console.log(res)
}

main()
