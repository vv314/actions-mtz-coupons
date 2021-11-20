const Notifier = require('../lib/Notifier')

const notifier = new Notifier({
  barkKey: process.env.BARK_KEY,
  workWechat: process.env.QYWX_SEND_CONF,
  serverChanToken: process.env.SC_SEND_KEY,
  telegram: {
    botToken: process.env.TG_BOT_TOKEN,
    userId: process.env.TG_USER_ID
  }
})

async function main() {
  console.log('\n## 消息推送 ##')

  try {
    const res = await Promise.all(
      notifier.notify('推送测试', '这是推送测试的消息' + Date.now())
    )

    console.log('result', res)
  } catch (e) {
    console.log('执行失败', e)
  }
}

module.exports = main
