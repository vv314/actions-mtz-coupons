import { getTemplateData, getRenderList } from '../src/template.js'
import getPayload from '../src/payload.js'
import ShadowGuard from '../src/shadow/index.js'
import grab from '../src/coupons/gundamGrab.js'
import { couponId } from '../src/coupons/const.js'

const guard = new ShadowGuard()

beforeAll(() => guard.init(grab.getActUrl(couponId.main.gid)))

test('Test getTemplateData', async () => {
  const res = await getTemplateData(null, couponId.main.gid)

  return expect(res).toMatchObject({
    pageId: expect.any(Number),
    gdId: expect.any(Number),
    actName: expect.any(String),
    appJs: expect.stringMatching(/app[^"]*\.js/)
  })
})

test('Test getRenderList', async () => {
  const renderList = await getRenderList(couponId.main.gid, guard)

  return expect(renderList).toEqual(expect.any(Array))
})

test('Test getPayload', async () => {
  const { gdId, appJs } = await getTemplateData(null, couponId.main.gid)
  const payload = await getPayload(gdId, appJs, guard)

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
