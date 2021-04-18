const parseToken = require('../lib/parse-token')
const TOKEN = process.env.TOKEN

async function main() {
  const tokens = parseToken(TOKEN)

  console.log('tokens', tokens)
}

main()
