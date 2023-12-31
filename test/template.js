import { getTemplateData, getRenderList } from '../src/template.js'
import ShadowGuard from '../src/shadow/index.js'
import mainGrab from '../src/coupons/gundam.js'
import { createMTCookie, parseToken } from '../src/user.js'
import { wxfwhActConfs } from '../src/coupons/const.js'

const guard = new ShadowGuard()
const tokens = parseToken(process.env.TOKEN)
const cookie = createMTCookie(tokens[0].token)

beforeAll(() => guard.init(mainGrab.getActUrl(wxfwhActConfs[0].gid)))

test('Test getTemplateData', async () => {
  const res = await getTemplateData(null, wxfwhActConfs[0].gid)

  return expect(res).toMatchObject({
    pageId: expect.any(Number),
    gdId: expect.any(Number),
    actName: expect.any(String),
    appJs: expect.stringMatching(/app[^"]*\.js/)
  })
})

test('Test getRenderList', async () => {
  const renderList = await getRenderList(cookie, 422308, guard)

  return expect(renderList).toEqual(expect.any(Array))
})
