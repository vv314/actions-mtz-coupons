const updateNotifier = require('../lib/update-notifier')

async function checkUpdate() {
  let message

  try {
    message = await updateNotifier()
  } catch (e) {
    console.log('update 执行失败', e)
  }

  if (!message) return

  console.log(`\n—————————— 更新提醒 ——————————\n`)
  console.log(message)
}

checkUpdate()
