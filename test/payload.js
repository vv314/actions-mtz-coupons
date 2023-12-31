import { getTemplateData } from '../src/template.js'
import ShadowGuard from '../src/shadow/index.js'
import mainAct from '../src/coupons/gundamGrab.js'
import wxfwhAct from '../src/coupons/wxfwh.js'
import { mainActConf, wxfwhActConf } from '../src/coupons/const.js'
import { createMTCookie, parseToken } from '../src/user.js'

const guard = new ShadowGuard()

beforeAll(() => guard.init(mainAct.getActUrl(mainActConf[0].gid)))

test('Test Main Payload', async () => {
  const { gdId, appJs } = await getTemplateData(null, mainActConf[0].gid)
  const payload = await mainAct.getPayload(gdId, appJs, guard)

  return expect(payload).toMatchObject({
    actualLatitude: 0,
    actualLongitude: 0,
    app: -1,
    platform: 3,
    couponConfigIdOrderCommaString: expect.any(String),
    couponAllConfigIdOrderString: expect.any(String),
    gundamId: gdId,
    needTj: expect.any(Boolean),
    instanceId: expect.any(String),
    h5Fingerprint: '',
    rubikCouponKey: expect.any(String)
  })
})

test('Test Wxfwh Payload', async () => {
  const tokens = parseToken(process.env.TOKEN)
  const cookie = createMTCookie(tokens[0].token)
  const { gdId, pageId, renderList, appJs } = await getTemplateData(
    null,
    wxfwhActConf[1].gid
  )
  const payload = await wxfwhAct.getPayload(cookie, {
    gdId,
    pageId,
    renderList,
    appJs,
    fingerprint: guard.fingerprint
  })

  return expect(payload).toMatchObject({
    ctype: 'wm_wxapp',
    fpPlatform: 13,
    wxOpenId: '',
    appVersion: '',
    gdId: gdId,
    pageId: pageId,
    tabs: expect.any(Array),
    activityViewId: expect.any(String),
    instanceId: expect.any(String),
    mtFingerprint: expect.any(String)
  })
})

test('Test Wxfwh grab', async () => {
  const tokens = parseToken(process.env.TOKEN)
  const cookie = createMTCookie(tokens[0].token)
  const res = await wxfwhAct.grabCoupon(cookie, wxfwhActConf[1].gid, guard)

  return expect(res).toBeTruthy()
})
