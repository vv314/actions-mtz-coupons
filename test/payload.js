import { getTemplateData } from '../src/template.js'
import ShadowGuard from '../src/shadow/index.js'
import mainAct from '../src/coupons/gundam.js'
import wxfwhAct from '../src/coupons/wxfwh.js'
import { mainActConf, wxfwhActConfs } from '../src/coupons/const.js'
import { createMTCookie, parseToken } from '../src/user.js'

const guard = new ShadowGuard()
const tokens = parseToken(process.env.TOKEN)
const cookie = createMTCookie(tokens[0].token)

beforeAll(() => guard.init(mainAct.getActUrl(mainActConf.gid)))

test('Test Main Payload', async () => {
  const tmplData = await getTemplateData(null, mainActConf.gid)
  const payload = await mainAct.getPayload(cookie, tmplData, guard)

  return expect(payload).toMatchObject({
    actualLatitude: 0,
    actualLongitude: 0,
    app: -1,
    platform: 3,
    couponConfigIdOrderCommaString: expect.any(String),
    couponAllConfigIdOrderString: expect.any(String),
    gundamId: tmplData.gdId,
    needTj: expect.any(Boolean),
    instanceId: expect.any(String),
    h5Fingerprint: '',
    rubikCouponKey: expect.any(String)
  })
})

test('Test Wxfwh Payload', async () => {
  const tmplData = await getTemplateData(null, wxfwhActConfs[1].gid)
  const payload = await wxfwhAct.getPayload(cookie, tmplData, guard)

  return expect(payload).toMatchObject({
    ctype: 'wm_wxapp',
    fpPlatform: 13,
    wxOpenId: '',
    appVersion: '',
    gdId: tmplData.gdId,
    pageId: tmplData.pageId,
    tabs: expect.any(Array),
    activityViewId: expect.any(String),
    instanceId: expect.any(String),
    mtFingerprint: expect.any(String)
  })
})

test('Test Wxfwh grab', async () => {
  const res = await wxfwhAct.grabCoupon(cookie, wxfwhActConfs[1].gid, guard)

  return expect(res).toBeTruthy()
})
