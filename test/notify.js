const Notifier = require('../lib/Notifier')

const notifier = new Notifier({
  barkToken: process.env.BARK_KEY,
  workWechat: process.env.QYWX_SEND_CONF,
  serverChanToken: process.env.SC_SEND_KEY
  // telegram: {
  //   botToken: process.env.TG_BOT_TOKEN,
  //   userId: process.env.TG_USER_ID
  // }
})

async function main() {
  console.log('## 推送测试 ##')

  notifier
    .notify('推送测试', '这是推送测试的消息' + Date.now())
    .then(res => res.forEach(e => console.log(e)))
}

main()
