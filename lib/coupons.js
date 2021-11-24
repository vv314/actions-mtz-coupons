const fetch = require('node-fetch')

const ECODE = {
  AURH: 1,
  API: 2,
  NETWOEK: 3,
  RUNTIME: 4
}

const GUNDAM_ID = '2KAWnD'
const baseApi = new URL('https://mediacps.meituan.com')
const actUrl = new URL(
  `https://market.waimai.meituan.com/gd/single.html?el_biz=waimai&el_page=gundam.loader&gundam_id=${GUNDAM_ID}`
)

function genCookie(token) {
  return token.startsWith('token=') ? token : `token=${token}`
}

async function doPost(api, opts = {}) {
  const url = api.startsWith('http') ? api : baseApi.origin + api
  let result

  try {
    result = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(opts.data),
      headers: {
        'Content-Type': 'application/json',
        // 重要：需设置 UA
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1',
        Host: baseApi.host,
        Referer: actUrl.origin + '/',
        Origin: actUrl.origin,
        cookie: opts.cookie
      },
      timeout: 10000
    })
  } catch (e) {
    throw { code: ECODE.NETWOEK, url: url, msg: e }
  }

  if (result.status == 200) {
    result = result.json()
  } else {
    result = { message: result.statusText }
  }

  return result
}

async function getGlobalData(cookie) {
  const text = await fetch(
    `https://market.waimai.meituan.com/api/template/get?env=current&el_biz=waimai&el_page=gundam.loader&gundam_id=${GUNDAM_ID}`,
    {
      headers: {
        cookie: cookie
      }
    }
  ).then((rep) => rep.text())
  const result = text.match(/globalData: ({.+})/)
  const globalData = result && result[1]

  try {
    return JSON.parse(globalData)
  } catch (e) {
    throw new Error(`globalData 获取失败: ${e}`)
  }
}

async function getGundamId(cookie) {
  const globalData = await getGlobalData(cookie)
  const gundamId = globalData.gdId

  if (!gundamId) {
    throw new Error('gundamId 获取失败')
  }

  return gundamId
}

async function getMTUerId(cookie) {
  const rep = await fetch('https://h5.waimai.meituan.com/waimai/mindex/home', {
    headers: {
      cookie: cookie
    }
  })

  const repCookie = rep.headers.get('set-cookie') || ''
  const matchArr = repCookie.match(/userId=(\w+)/) || []

  return matchArr[1] || ''
}

async function getUserInfo(cookie) {
  const res = await doPost('/gundam/gundamLogin', { cookie })

  if (res.code == 0) return res.data

  if (res.code == 3) {
    throw { code: ECODE.AURH, api: 'gundamLogin', msg: res.msg }
  }

  throw { code: ECODE.API, api: 'gundamLogin', msg: res.msg }
}

async function grabCoupon(cookie, gundamId) {
  const res = await doPost('/gundam/gundamGrabV3', {
    cookie,
    data: {
      actualLatitude: '',
      actualLongitude: '',
      gundamId: gundamId,
      defaultGrabKey: 'E28198A627324F85B4FF89FA10D093EC',
      needTj: true
    }
  })

  if (res.code == 0) return res.data

  if (res.code == 3) {
    throw { code: ECODE.AURH, api: 'gundamGrabV3', msg: res.msg }
  }

  throw { code: ECODE.API, api: 'gundamGrabV3', msg: res.msg }
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

// 对手机号脱敏处理
function replacePhoneNumber(str) {
  return str.replace(/1[3456789]\d{9}/, (match) =>
    match.replace(/^(\d{3})\d{4}(\d+)/, '$1****$2')
  )
}

async function runTask(cookie) {
  try {
    const userInfo = await getUserInfo(cookie)
    const gundamId = await getGundamId(cookie)
    const grabResult = await grabCoupon(cookie, gundamId)

    return {
      code: 0,
      data: {
        user: userInfo,
        coupons: formatCoupons(grabResult.coupons)
      },
      msg: '成功'
    }
  } catch (e) {
    const data = {
      actUrl: actUrl.href
    }
    let code, msg

    // console.log('getCoupons error', e)

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

    return { code, data, msg, error: e }
  }
}

/**
 * 领取优惠券
 * @param  {String} token 用户 token
 * @param  {Number} maxRetry  最大重试次数
 * @return {Promise(<Object>)} 结果
 */
async function getCoupons(token, maxRetry = 0) {
  if (!token) {
    return {
      code: ECODE.RUNTIME,
      msg: '请设置 token',
      error: ''
    }
  }

  const cookie = genCookie(token)

  async function main(retryTimes = 0) {
    const result = await runTask(cookie)
    const needRetry = [ECODE.NETWOEK, ECODE.API].includes(result.code)

    // 标记重试次数
    result['retryTimes'] = retryTimes

    if (!needRetry || retryTimes >= maxRetry) return result

    return main(++retryTimes)
  }

  return main()
}

module.exports = { getCoupons }
