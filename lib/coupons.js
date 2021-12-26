const fetch = require('./fetch')
const getPayload = require('./payload')

const ECODE = {
  SUCC: 0,
  AUTH: 1,
  API: 2,
  NETWOEK: 3,
  RUNTIME: 4
}

const GUNDAM_ID = '2KAWnD'
const baseApi = 'https://mediacps.meituan.com'
const actUrl = new URL(
  `https://market.waimai.meituan.com/gd/single.html?el_biz=waimai&el_page=gundam.loader&gundam_id=${GUNDAM_ID}`
)

function genSetCookieStr(token) {
  const domain = 'Domain=.meituan.com'
  const path = 'Path=/'
  const http = 'HttpOnly'
  const expire = 'Max-Age=3600'
  const content = token.startsWith('token=') ? token : `token=${token}`

  return [content, domain, path, http, expire].join(';')
}

async function doPost(api, opts = {}) {
  const url = api.startsWith('http') ? api : baseApi + api

  return fetch.post(url, opts.data, {
    headers: {
      // 重要：需设置 UA
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1',
      Origin: actUrl.origin,
      Referer: actUrl.origin + '/'
    }
  })
}

async function getTemplateData() {
  const text = await fetch(
    `https://market.waimai.meituan.com/api/template/get?env=current&el_biz=waimai&el_page=gundam.loader&gundam_id=${GUNDAM_ID}`
  ).then((rep) => rep.text())
  const matchGlobal = text.match(/globalData: ({.+})/)
  const matchAppJs = text.match(/https:\/\/[./_-\w]+app\.js(?=")/g)

  try {
    const globalData = JSON.parse(matchGlobal[1])

    return {
      gundamId: globalData.gdId,
      appJs: matchAppJs[0]
    }
  } catch (e) {
    throw new Error(`活动配置数据获取失败: ${e}`)
  }
}

async function getMTUerId() {
  const rep = await fetch('https://h5.waimai.meituan.com/waimai/mindex/home')

  const repCookie = rep.headers.get('set-cookie') || ''
  const matchArr = repCookie.match(/userId=(\w+)/) || []

  return matchArr[1] || ''
}

async function getUserInfo() {
  const res = await doPost('/gundam/gundamLogin')

  if (res.code == 0) return res.data

  if (res.code == 3) {
    throw { code: ECODE.AUTH, api: 'gundamLogin', msg: res.msg || res.message }
  }

  throw { code: ECODE.API, api: 'gundamLogin', msg: res.msg || res.message }
}

async function grabCoupon(tmplData) {
  const payload = await getPayload(tmplData.gundamId, tmplData.appJs)
  const res = await doPost('/gundam/gundamGrabV3', {
    data: payload
  })

  if (res.code == 0) return res.data

  if (res.code == 3) {
    throw { code: ECODE.AUTH, api: 'gundamGrabV3', msg: res.msg || res.message }
  }

  throw { code: ECODE.API, api: 'gundamGrabV3', msg: res.msg || res.message }
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

async function runTask() {
  try {
    // 优先检测登录状态
    const userInfo = await getUserInfo()

    const tmplData = await getTemplateData()
    const grabResult = await grabCoupon(tmplData)

    return {
      code: ECODE.SUCC,
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
      case ECODE.AUTH:
        code = ECODE.AUTH
        msg = '登录过期'
        break
      case fetch.ECODE.FETCH:
        code = ECODE.API
        msg = '接口异常'
        break
      case fetch.ECODE.NETWOEK:
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
async function getCoupons(token, { maxRetry = 0, httpProxy }) {
  if (!token) {
    return {
      code: ECODE.RUNTIME,
      msg: '请设置 token',
      error: ''
    }
  }

  const cookie = genSetCookieStr(token)

  fetch.cookieJar.setCookieSync(cookie, actUrl)

  if (httpProxy) {
    fetch.setProxyAgent(httpProxy)
  }

  async function main(retryTimes = 0) {
    const result = await runTask()
    const needRetry = [fetch.ECODE.NETWOEK, fetch.ECODE.API].includes(
      result.code
    )

    // 标记重试次数
    result['retryTimes'] = retryTimes

    if (!needRetry || retryTimes >= maxRetry) return result

    return main(++retryTimes)
  }

  return main()
}

module.exports = { getCoupons, ECODE }
