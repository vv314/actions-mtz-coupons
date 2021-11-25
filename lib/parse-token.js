function tokenFormat(token, index = 0) {
  const defToken = {
    token: '',
    alias: '',
    index: index + 1,
    tgUid: '',
    qywxUid: '',
    barkKey: ''
  }

  if (typeof token == 'string') {
    token = { token }
  }

  return Object.assign({}, defToken, token)
}

function parseToken(token) {
  try {
    token = JSON.parse(token)
    console.log('传入的TOKEN变量是JSON对象')
  } catch (e) {
    console.log('传入的TOKEN变量是非JSON对象')
  }
  const likeArray = token.constructor == Array
  const likeObject = token.constructor == Object
  let tokenList = []

  if (!likeArray && !likeObject) {
    return [tokenFormat(token)]
  }

  tokenList = tokenList.concat(token)

  return tokenList.map(tokenFormat)
}

module.exports = parseToken
