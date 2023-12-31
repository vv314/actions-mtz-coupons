import { getTemplateData, getRenderList } from '../src/template.js'
import ShadowGuard from '../src/shadow/index.js'
import grab from '../src/coupons/gundamGrab.js'
import { wxfwhActConf } from '../src/coupons/const.js'

const guard = new ShadowGuard()

beforeAll(() => guard.init(grab.getActUrl(wxfwhActConf[0].gid)))

test('Test getTemplateData', async () => {
  const res = await getTemplateData(null, wxfwhActConf[0].gid)

  return expect(res).toMatchObject({
    pageId: expect.any(Number),
    gdId: expect.any(Number),
    actName: expect.any(String),
    appJs: expect.stringMatching(/app[^"]*\.js/)
  })
})

test('Test getRenderList', async () => {
  const renderList = await getRenderList(422308, guard)

  return expect(renderList).toEqual(expect.any(Array))
})
