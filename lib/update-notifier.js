const fetch = require('node-fetch')

async function getLatestRelease() {
  const res = await fetch(
    'https://api.github.com/repos/vv314/actions-mtz-coupons/releases',
    { timeout: 5000 }
  ).then(rep => rep.json())

  const info = res.filter(e => !e.draft || !e.prerelease)[0]

  return {
    tag: info.tag_name,
    version: info.name.replace('v', ''),
    date: info.published_at.substr(0, 10),
    url: info.html_url,
    message: info.body.replace(/\r\n/g, '\n')
  }
}

function getNotifyMessage(release) {
  const currentVersion = require('../package.json').version

  const message = [
    `新版本待更新 ${currentVersion} → ${release.version}`,
    '',
    release.message,
    '',
    '执行 `npm run sync` 同步复刻'
  ].join('\n')

  return message
}

async function checkUpdate() {
  const currentVersion = require('../package.json').version
  let release

  try {
    release = await getLatestRelease()
  } catch (e) {
    if (e.message.startsWith('network timeout')) {
      e = '请求超时'
    }

    throw '检查更新失败: ' + e
  }

  if (currentVersion == release.version) return ''

  return getNotifyMessage(release)
}

module.exports = checkUpdate
