const parseToken = require('../lib/parse-token')
const TOKEN = process.env.TOKEN

async function main() {
  console.log('\n## 解析 token ##')

  try {
    const tokens = parseToken(TOKEN)

    console.log('tokens', tokens)
  } catch (e) {
    console.log('执行失败')
  }
}

module.exports = main
