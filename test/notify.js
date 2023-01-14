import Notifier from '../lib/Notifier'

const notifier = new Notifier({
  barkKey: process.env.BARK_KEY,
  larkWebhook: process.env.LARK_WEBHOOK,
  workWechat: process.env.QYWX_SEND_CONF,
  serverChanToken: process.env.SC_SEND_KEY,
  pushplusToken: process.env.PUSHPLUS_TOKEN,
  dingTalkWebhook: process.env.DINGTALK_WEBHOOK,
  telegram: {
    botToken: process.env.TG_BOT_TOKEN,
    userId: process.env.TG_USER_ID
  },
  qmsg: {
    token: process.env.QMSG_KEY,
    qq: process.env.QMSG_ADMIN
  }
})

const date = new Date()
const title = '推送测试'
const content = `这是推送测试的消息:\n- 11111\n- 22222\n- ${[
  date.getHours(),
  date.getMinutes(),
  date.getSeconds()
].join(':')}`

test('统一推送测试', async () => {
  const res = await Promise.all(notifier.notify(title, content))

  expect(res.filter((e) => e.success).length).toBe(res.length)
})
