function tokenFormat(token, index = 0) {
  const defToken = {
    token: '',
    alias: '',
    index: index + 1,
    tgUid: '',
    qywxUid: '',
    barkKey: '',
    larkWebhook: '',
    qq: ''
  }

  if (typeof token == 'string') {
    token = { token }
  }

  return Object.assign({}, defToken, token)
}

function parseToken(token) {
  if (!token) throw '请配置 TOKEN'

  const likeJson = ['{', '['].includes(token.trim()[0])

  if (!likeJson) return [tokenFormat(token)]

  try {
    token = JSON.parse(token)
  } catch (e) {
    throw `TOKEN 解析错误: ${e.message}`
  }

  return [].concat(token).map(tokenFormat)
}

export default parseToken
