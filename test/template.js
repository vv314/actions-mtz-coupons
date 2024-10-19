import { beforeAll, expect, test } from 'vitest'
import { getTemplateData, getRenderList } from '../src/template.js'
import ShadowGuard from '../src/shadow/index.js'
import gundam from '../src/coupons/gundam.js'
import { createMTCookie, parseToken } from '../src/user.js'
import { wxfwhActConfs } from '../src/coupons/const.js'

const guard = new ShadowGuard()
const tokens = parseToken(process.env.TOKEN)
const cookie = createMTCookie(tokens[0].token)

beforeAll(() => guard.init(gundam.getActUrl(wxfwhActConfs[0].gid)))

test('GetTemplateData', async () => {
  const res = await getTemplateData(cookie, wxfwhActConfs[0].gid, guard)

  return expect(res).toMatchObject({
    pageId: expect.any(Number),
    gdId: expect.any(Number),
    actName: expect.any(String),
    appJs: expect.stringMatching(/app[^"]*\.js/)
  })
})

test('GetRenderList', async () => {
  const renderList = await getRenderList(
    cookie,
    { gundamViewId: '1I9uL6', pageId: 544003, gdId: 466632 },
    guard
  )

  return expect(renderList).toEqual(expect.any(Array))
})
