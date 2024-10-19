import semver from 'semver'
import { readPkgJson } from './util/index.js'
import request from './request.js'

const { version: currentVersion } = readPkgJson()

async function getLatestRelease(timeout = 5000) {
  const res = await request.get(
    'https://api.github.com/repos/vv314/actions-mtz-coupons/releases',
    {
      timeout: timeout
    }
  )

  const info = res.filter((e) => !e.draft || !e.prerelease)[0]

  return {
    tag: info.tag_name,
    version: info.name.replace('v', ''),
    date: info.published_at.substr(0, 10),
    url: info.html_url,
    message: info.body.replace(/\r\n/g, '\n')
  }
}

function getNotifyMessage(release) {
  const message = [
    `新版本就绪 ${currentVersion} → ${release.version}`,
    '',
    release.message,
    '',
    '执行 `npm run sync` 同步复刻'
  ].join('\n')

  return message
}

async function checkUpdate(timeout) {
  let release

  try {
    release = await getLatestRelease(timeout)
  } catch (e) {
    let errMsg = e.msg ?? e.message

    if (e.code === request.ECODE.TIMEOUT) {
      errMsg = '请求超时'
    }

    throw '检查更新失败: ' + errMsg
  }

  if (semver.gt(release.version, currentVersion)) {
    return getNotifyMessage(release)
  }

  return ''
}

export default checkUpdate
