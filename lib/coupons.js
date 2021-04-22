const fetch = require('node-fetch')
const querystring = require('querystring')

const ECODE = {
  AURH: 1,
  API: 2,
  NETWOEK: 3,
  RUNTIME: 4
}

const API_HOST = 'https://mediacps.meituan.com'
const actUrl =
  'https://market.waimai.meituan.com/gd/single.html?el_biz=waimai&el_page=gundam.loader&gundam_id=2KAWnD&cpsMedia=1382653907074859021&utm_source=60413&channel=union'

function genCookie(token) {
  return token.startsWith('token=') ? token : `token=${token}`
}

async function doPost(api, opts = {}) {
  const url = api.startsWith('http') ? api : API_HOST + api
  let result

  try {
    result = await fetch(url, {
      method: 'POST',
      body: querystring.stringify(opts.data),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        cookie: opts.cookie
      },
      timeout: 10000
    })
  } catch (e) {
    throw { code: ECODE.NETWOEK, url: url, msg: e }
  }

  return result.json()
}

// @Deprecated
async function getRule() {
  // return doPost('https://activityunion-marketing.meituan.com/mtz/index').then(
  //   res => res.data.rule
  // )

  return []
}

async function getGlobalData(cookie) {
  const text = await fetch(
    'https://market.waimai.meituan.com/api/template/get?env=current&el_biz=waimai&el_page=gundam.loader&gundam_id=2KAWnD&cpsMedia=1382653907074859021&channel=union',
    {
      headers: {
        cookie: cookie
      }
    }
  ).then(rep => rep.text())
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

async function grabCoupon(cookie, gundamId) {
  const res = await doPost('/gundam/gundamGrab', {
    cookie,
    data: {
      actualLatitude: 0,
      actualLongitude: 0,
      grabKey: 'AD317E383B064F84ACE3A8DCDC8C2572',
      gundamId: gundamId
    }
  })

  if (res.code == 0) return res.data

  if (res.code == 3) {
    throw { code: ECODE.AURH, api: 'gundamGrab', msg: res.msg }
  }

  throw { code: ECODE.API, api: 'gundamGrab', msg: res.message }
}

async function queryGrabResult(cookie, gundamId) {
  const res = await doPost('/gundam/gundamGrabResult', {
    cookie,
    data: {
      gundamId: gundamId
    }
  })

  if (res.code == 0) return res.data
  if (res.code == 3) {
    throw { code: ECODE.AURH, api: 'gundamGrabResult', msg: res.msg }
  }

  throw { code: ECODE.API, api: 'gundamGrabResult' }
}

function formatCoupons(coupons) {
  return coupons.map(item => ({
    name: item.couponName,
    etime: item.etime,
    amount: item.couponAmount,
    amountLimit: item.amountLimit,
    useCondition: replacePhoneNumber(item.useCondition)
  }))
}

// 对手机号脱敏处理
function replacePhoneNumber(str) {
  return str.replace(/1[3456789]\d{9}/, match =>
    match.replace(/^(\d{3})\d{4}(\d+)/, '$1****$2')
  )
}

async function runTask(cookie) {
  try {
    const gundamId = await getGundamId(cookie)

    await grabCoupon(cookie, gundamId)

    const grabResult = await queryGrabResult(cookie, gundamId)

    return {
      code: 0,
      data: {
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

module.exports = { getCoupons, getRule }
