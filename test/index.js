require('dotenv').config()

async function test() {
  await require('./parseToken')()
  await require('./userInfo')()
  await require('./coupons')()
  await require('./notify')()
  await require('./update')()
}

test()
