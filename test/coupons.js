process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import parseToken from '../lib/parse-token'
import { getCoupons, ECODE } from '../lib/coupons'

test('领取优惠券', async () => {
  const tokens = parseToken(process.env.TOKEN)
  const res = await getCoupons(tokens[0].token, {
    // proxy: 'http://127.0.0.1:8887'
  })

  expect(res.code).toBe(ECODE.SUCC)
})

test('token 错误', async () => {
  const res = await getCoupons('invalid token', {
    // proxy: 'http://127.0.0.1:8887'
  })

  expect(res.code).toBe(ECODE.AUTH)
})
