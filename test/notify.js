import { expect, test } from 'vitest'
import Notifier from '../src/notifier/index.js'

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
const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
const content = [
  '- ¥12 (满20可用 - 外卖节红包)',
  '- ¥10 (满39可用 - 外卖节红包)',
  '- ¥25 (满69可用 - 水果大额满减券)',
  '- ¥15 (满59可用 - 便利店满减红包)'
].join('\n')

test('Notifier', async () => {
  const res = await Promise.all(
    notifier.notify(title, `账号 X:\n${content}\n- Time ${time}`)
  )

  expect(res.filter((e) => e.success).length).toBe(res.length)
})
