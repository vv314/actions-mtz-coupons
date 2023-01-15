import { spawn } from 'node:child_process'

function gitExec(opt) {
  const pull = spawn('git', opt.split(' '))

  return new Promise((resolve, reject) => {
    let res = ''

    pull.stdout.on('data', (buffer) => {
      res += buffer.toString()
    })

    pull.stderr.on('data', (buffer) => {
      res += buffer.toString()
    })

    pull.on('close', (code) => {
      code == 0 ? resolve(res) : reject(res)
    })
  })
}

async function getRemoteUrls() {
  const urls = await gitExec('remote -v')

  return urls.split('\n')
}

function addUpstream(upstreamUrl) {
  return gitExec(`remote add upstream ${upstreamUrl}`)
}

function setUpstream(upstreamUrl) {
  return gitExec(`remote set-url upstream ${upstreamUrl}`)
}

function pullUpstream() {
  return gitExec('pull upstream main:main')
}

function pushOrigin() {
  return gitExec('push origin main:main')
}

async function main() {
  const upstreamUrl = 'git@github.com:vv314/actions-mtz-coupons.git'

  console.log('———— [1/4] 获取上游仓库信息 ————')
  const urls = await getRemoteUrls()
  const exist = urls.some((url) => url.startsWith('upstream'))

  if (!exist) {
    console.log('———— [2/4] 添加上游仓库 ————')
    await addUpstream(upstreamUrl)
  } else {
    console.log('———— [2/4] 设置上游仓库 ————')
    await setUpstream(upstreamUrl)
  }

  try {
    console.log('———— [3/4] 拉取上游仓库 ————')
    const pullRes = await pullUpstream()
    console.log(pullRes)

    console.log('———— [4/4] 推送更新 ————')
    const pushRes = await pushOrigin()
    console.log(pushRes)

    console.log('同步成功')
  } catch (e) {
    console.log(e)
    console.log('同步失败')
  }
}

main()
