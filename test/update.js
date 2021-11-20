const updateNotifier = require('../lib/update-notifier')

async function checkUpdate() {
  console.log('\n## 检查更新 ##')

  try {
    const timeout = 5000
    const message = await updateNotifier(timeout)

    if (!message) return console.log('无更新')

    console.log(`\n—————————— 更新信息 ——————————\n`)
    console.log(message)
  } catch (e) {
    console.log('执行失败', e)
  }
}

module.exports = checkUpdate
