import tough from 'tough-cookie'
import ShadowGuard from '../src/shadow/index.js'
import mainGrab from '../src/coupons/gundam.js'
import { createMTCookie, getUserInfo, parseToken } from '../src/user.js'
import { mainActConf } from '../src/coupons/const.js'

const guard = new ShadowGuard()

beforeAll(() => guard.init(mainGrab.getActUrl(mainActConf.gid)))

test('Test Token Undefined', () => {
  expect(() => parseToken()).toThrow('请配置 TOKEN')
})

test('Test String Token', () => {
  expect(parseToken('aaa')).toContainEqual({
    token: 'aaa',
    alias: '',
    index: 1,
    tgUid: '',
    qywxUid: '',
    barkKey: '',
    larkWebhook: '',
    qq: ''
  })
})

test('Test JSON Token', () => {
  const token = `
    {
      "token": "aaa"
    }
  `

  expect(parseToken(token)).toContainEqual({
    token: 'aaa',
    alias: '',
    index: 1,
    tgUid: '',
    qywxUid: '',
    barkKey: '',
    larkWebhook: '',
    qq: ''
  })
})

test('Test Multiple Token', () => {
  expect(parseToken('["aaa", {"token": "bbb", "alias": "jeff"}]')).toEqual(
    expect.arrayContaining([
      {
        token: 'aaa',
        alias: '',
        index: 1,
        tgUid: '',
        qywxUid: '',
        barkKey: '',
        larkWebhook: '',
        qq: ''
      },
      {
        token: 'bbb',
        alias: 'jeff',
        index: 2,
        tgUid: '',
        qywxUid: '',
        barkKey: '',
        larkWebhook: '',
        qq: ''
      }
    ])
  )
})

test('Test JSON Token Verification', () => {
  expect(() => parseToken('{token: "aaa"}')).toThrow('TOKEN 解析错误')
})

test('Test Multiple Token Verification', () => {
  expect(() => parseToken('["aaa", {token: "bbb"}]')).toThrow('TOKEN 解析错误')
})

test('Test Cookie', () => {
  const tokens = parseToken(process.env.TOKEN)
  const cookie = createMTCookie(tokens[0].token)

  expect(cookie).toBeInstanceOf(tough.CookieJar)
})

test('Test Login', async () => {
  const tokens = parseToken(process.env.TOKEN)
  const cookie = createMTCookie(tokens[0].token)
  const userInfo = await getUserInfo(cookie)

  expect(userInfo).toBeTruthy()
})

test('Test Login With Guard', async () => {
  const tokens = parseToken(process.env.TOKEN)
  const cookie = createMTCookie(tokens[0].token)
  const userInfo = await getUserInfo(cookie, guard)

  expect(userInfo).toBeTruthy()
})
