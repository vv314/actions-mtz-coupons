const fetch = require('node-fetch')
const ECODE = {
  AURH: 1,
  API: 2,
  NETWOEK: 3,
  RUNTIME: 4
}

const actUrl =
  'https://activityunion-marketing.meituan.com/mtzcoupon/index.html'
let $request

function genRequest(token) {
  const host = 'https://activityunion-marketing.meituan.com'
  const cookie = token.startsWith('token=') ? token : `token=${token}`
  let result

  return async (api, data = {}) => {
    const url = api.startsWith('http') ? api : host + api

    try {
      result = await fetch(url, {
        method: 'POST',
        data: data,
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
  return $request('/mtz/index').then((res) => res.data.rule)
}

async function grabCoupon() {
  const res = await $request('/mtz/grab')

  if (res.code == 0) return res.data
  if (res.code == 3) throw { code: ECODE.AURH, msg: res.msg }

  throw { code: ECODE.API }
}

async function queryGrabResult() {
  const res = await $request('/mtz/queryGrabResult')

  if (res.code == 0) return res.data
  if (res.code == 3) throw { code: ECODE.AURH, msg: res.msg }

  throw { code: ECODE.API }
}

function formatCoupons(coupons) {
  return coupons.map((item) => ({
    name: item.couponName,
    etime: item.etime,
    amount: item.couponAmount,
    amountLimit: item.amountLimit,
    useCondition: item.useCondition
  }))
}

/**
 * 领取优惠券
 * @param  {String} token 用户 token
 * @return {Promise(<Object>)} 结果
 */
async function getCoupons(token) {
  if (!token) {
    return {
      code: ECODE.RUNTIME,
      msg: '请设置 token'
    }
  }

  $request = genRequest(token)

  try {
    await grabCoupon()

    const rule = await getRule()
    const grabResult = await queryGrabResult()

    return {
      code: 0,
      data: {
        rule: rule,
        sendStatus: grabResult.sendStatus,
        coupons: formatCoupons(grabResult.coupons),
        useUrl: grabResult.defaultUseUrl,
        phone: grabResult.phoneNum
      },
      msg: '成功'
    }
  } catch (e) {
    const data = {
      actUrl: actUrl
    }
    let code, msg

    console.log('getCoupons error', e)

    switch (e.code) {
      case ECODE.AURH:
        code = ECODE.AURH
        msg = '登录过期'
        break
      case ECODE.API:
        code = ECODE.API
        msg = '接口异常'
        break
      case ECODE.NETWOEK:
        code = ECODE.NETWOEK
        msg = '网络异常'
        break
      default:
        code = ECODE.RUNTIME
        msg = '程序异常'
    }

    return { code, data, msg }
  }
}

module.exports = getCoupons
