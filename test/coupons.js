const { getRule, getCoupons } = require('../lib/coupons')

const TOKEN = process.env.TOKEN

async function main() {
  const res = await getCoupons(TOKEN)

  console.log(res)
}

main()
