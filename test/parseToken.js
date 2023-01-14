import parseToken from '../lib/parse-token'

test('未配置', () => {
  expect(() => parseToken()).toThrow('请配置 TOKEN')
})

test('字符串格式', () => {
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

test('JSON 格式', () => {
  expect(parseToken('{"token": "aaa"}')).toContainEqual({
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

test('格式化 JSON', () => {
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

test('多账户配置', () => {
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

test('JSON 语法错误', () => {
  expect(() => parseToken('{token: "aaa"}')).toThrow('TOKEN 解析错误')
})

test('多账户 JSON 语法错误', () => {
  expect(() => parseToken('["aaa", {token: "bbb"}]')).toThrow('TOKEN 解析错误')
})
