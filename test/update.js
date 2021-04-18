const updateNotifier = require('../lib/update-notifier')

async function checkUpdate() {
  const message = await updateNotifier()

  if (!message) return

  console.log(`\n—————————— 更新提醒 ——————————\n`)
  console.log(message)
}

checkUpdate()
