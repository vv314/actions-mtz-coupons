import { beforeAll, expect, test } from 'vitest'
import { getTemplateData } from '../src/template.js'
import ShadowGuard from '../src/shadow/index.js'
import gundam from '../src/coupons/gundam.js'
import wxfwh from '../src/coupons/wxfwh.js'
import { mainActConf, wxfwhActConfs } from '../src/coupons/const.js'
import { createMTCookie, parseToken } from '../src/user.js'

const guard = new ShadowGuard()
const tokens = parseToken(process.env.TOKEN)
const cookie = createMTCookie(tokens[0].token)

beforeAll(() => guard.init(gundam.getActUrl(mainActConf.gid)))

test('Main Payload', async () => {
  const tmplData = await getTemplateData(cookie, mainActConf.gid, guard)
  const payload = await gundam.getPayload(tmplData, guard)

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
    h5Fingerprint: expect.any(String)
  })
})

// test('Wxfwh Payload', async () => {
//   const tmplData = await getTemplateData(cookie, wxfwhActConfs[0].gid, guard)
//   const payload = await wxfwh.getPayload(cookie, tmplData, guard)

//   return expect(payload).toMatchObject({
//     ctype: 'wm_wxapp',
//     fpPlatform: 13,
//     wxOpenId: '',
//     appVersion: '',
//     gdId: tmplData.gdId,
//     pageId: tmplData.pageId,
//     tabs: expect.any(Array),
//     activityViewId: expect.any(String),
//     instanceId: expect.any(String),
//     mtFingerprint: expect.any(String)
//   })
// })
