require('dotenv').config()

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function test() {
  await require('./parseToken')()
  await require('./userInfo')()
  await require('./coupons')()
  await require('./notify')()
  await require('./update')()
}

test()
