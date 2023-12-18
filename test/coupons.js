process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import { parseToken } from '../src/user.js'
import { getCoupons, ECODE } from '../src/coupons/index.js'

test('Test Coupons', async () => {
  const tokens = parseToken(process.env.TOKEN)
  const res = await getCoupons(tokens[0].token, {
    // proxy: 'http://127.0.0.1:8887'
  })

  expect(res.code).toBe(ECODE.SUCC)
})

test('Test Token Error', async () => {
  const res = await getCoupons('invalid token', {
    // proxy: 'http://127.0.0.1:8887'
  })

  expect(res.code).toBe(ECODE.AUTH)
})
