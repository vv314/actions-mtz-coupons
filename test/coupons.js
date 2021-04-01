const { getRule } = require('../lib/coupons')

async function main() {
  const rule = await getRule()

  rule.forEach((item, index) => {
    console.log(`${++index}. ${item}`)
  })
}

main()
