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

function getNotifyMessage(info) {
  const currVersion = require('../package.json').version

  const message = [
    `新版本待更新 ${currVersion} → ${info.version}`,
    '',
    info.message,
    '',
    '执行 `npm run sync` 同步复刻'
  ].join('\n')

  return message
}

async function checkUpdate() {
  const currentVersion = require('../package.json').version

  try {
    const releaseInfo = await getLatestRelease()
    const latestVersion = releaseInfo.version

    if (currentVersion != latestVersion) {
      return getNotifyMessage(releaseInfo)
    }
  } catch (e) {
    console.log('检查更新失败: ' + e)
  }

  return ''
}

module.exports = checkUpdate
