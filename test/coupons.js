import { beforeAll, expect, test } from 'vitest'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

import ShadowGuard from '../src/shadow/index.js'
import { createMTCookie, parseToken } from '../src/user.js'
import { grabCoupons, ECODE } from '../src/coupons/index.js'
import { mainActConf, wxfwhActConfs } from '../src/coupons/const.js'
import gundam from '../src/coupons/gundam.js'
import wxfwh from '../src/coupons/wxfwh.js'
import lottery from '../src/coupons/lottery.js'

const guard = new ShadowGuard()
const tokens = parseToken(process.env.TOKEN)
const cookie = createMTCookie(tokens[0].token)

beforeAll(() => guard.init(gundam.getActUrl(mainActConf.gid)))

test('Main Grab', async () => {
  const res = await gundam.grabCoupon(cookie, mainActConf.gid, guard)

  return expect(res.length).toBeGreaterThan(0)
})

test('Token Error', async () => {
  const res = await grabCoupons('invalid token', {
    // proxy: 'http://127.0.0.1:8887'
  })

  return expect(res.code).toBe(ECODE.AUTH)
})

// test('Wxfwh grab', async () => {
//   const res = await wxfwh.grabCoupon(cookie, wxfwhActConfs[0].gid, guard)

//   return expect(res).toBeTruthy()
// })

// test('Wxfwh Result', async () => {
//   const res = await wxfwh.getCouponList(cookie, 'I5r2SYd5kTN1l1AkMhwCNA')

//   return expect(res.length).toBeGreaterThan(0)
// })

// test('Lottery Result', async () => {
//   const tmplData = await lottery.getTemplateData(cookie, '1VlhFT', guard)
//   const ticketConfig = await lottery.getTicketConfig(
//     tmplData.gdId,
//     tmplData.appJs
//   )
//   const res = await lottery.getCouponList(cookie, [
//     ticketConfig.channelUrl ?? ''
//   ])

//   return expect(res).toBeTruthy()
// })
