const fetch = require('node-fetch')
const ECODE = {
  API: 1,
  AURH: 2,
  NETWOEK: 3,
  RUNTIME: 4
}

const actUrl =
  'https://activityunion-marketing.meituan.com/mtzcoupon/index.html'
let $request

function genRequest(token) {
  const cookie = `token=${token}`
  let result

  return async (api) => {
    try {
      result = await fetch(api, {
        method: 'POST',
        headers: {
          cookie: cookie
        }
      })
    } catch (e) {
      throw { code: ECODE.NETWOEK }
    }

    return result.json()
  }
}

async function getRule() {
  const api = 'https://activityunion-marketing.meituan.com/mtz/index'

  return $request(api).then((res) => res.data.rule)
}

async function queryGrabResult() {
  const api = 'https://activityunion-marketing.meituan.com/mtz/queryGrabResult'
  const res = await $request(api)

  if (res.code == 0) return res.data

  if (res.code == 3) throw { code: ECODE.AURH, msg: res.msg }

  throw { code: ECODE.API }
}

async function getCoupons(token) {
  if (!token) {
    return {
      code: ECODE.RUNTIME,
      msg: '请设置 token'
    }
  }

  $request = genRequest(token)

  try {
    const grabResult = await queryGrabResult()
    const rule = await getRule()

    return {
      code: 0,
      data: {
        rule: rule,
        sendStatus: grabResult.sendStatus,
        coupons: grabResult.coupons,
        useUrl: grabResult.defaultUseUrl,
        phone: grabResult.phoneNum
      }
    }
  } catch (e) {
    console.log('getCoupons error', e)

    switch (e.code) {
      case ECODE.AURH:
        return {
          code: ECODE.AURH,
          data: {
            actUrl: actUrl
          },
          msg: '登录过期'
        }
      case ECODE.API:
        return {
          code: ECODE.API,
          msg: '接口异常'
        }
      case ECODE.NETWOEK:
        return {
          code: ECODE.NETWOEK,
          msg: '网络异常'
        }
      default:
        return {
          code: ECODE.RUNTIME,
          data: e,
          msg: '程序异常'
        }
    }
  }
}

module.exports = getCoupons
