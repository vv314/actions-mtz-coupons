const fetch = require('./fetch')
const presetPayload = require('./payload')

const ECODE = {
  AURH: 1,
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

async function getDynamicConf() {
  const text = await fetch(
    `https://market.waimai.meituan.com/api/template/get?env=current&el_biz=waimai&el_page=gundam.loader&gundam_id=${GUNDAM_ID}`
  ).then((rep) => rep.text())
  const matchGlobal = text.match(/globalData: ({.+})/)
  const matchAppJs = text.match(/https:\/\/[./_-\w]+app.js/g)

  try {
    const globalData = JSON.parse(matchGlobal[1])

    return {
      gdId: globalData.gdId,
      appJs: matchAppJs ? matchAppJs[1] : ''
    }
  } catch (e) {
    throw new Error(`活动配置数据获取失败: ${e}`)
  }
}

async function getPayload(url) {}

async function getGundamId() {
  const conf = await getDynamicConf()
  const gundamId = conf.gdId

  if (!gundamId) {
    throw new Error('gundamId 获取失败')
  }

  return gundamId
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
    throw { code: ECODE.AURH, api: 'gundamLogin', msg: res.msg || res.message }
  }

  throw { code: ECODE.API, api: 'gundamLogin', msg: res.msg || res.message }
}

async function getRenderInfo(gundamId) {
  let data

  try {
    const res = await fetch.get(
      'https://market.waimai.meituan.com/gd/zc/renderinfo',
      {
        params: {
          el_biz: 'waimai',
          el_page: 'gundam.loader',
          gundam_id: GUNDAM_ID,
          gdId: gundamId,
          tenant: 'gundam'
        }
      }
    )

    data = res.data
  } catch (e) {
    throw new Error('renderinfo 接口调用失败')
  }

  return Object.keys(data).filter((k) => data[k].render)
}

async function resolvePayload(gundamId) {
  const renderList = await getRenderInfo(gundamId)

  const adapter = (conf) => ({
    grabKey: conf.redBagChannelId,
    couponConfigIdOrderCommaString: conf.couponIds.join(','),
    defaultGrabKey: conf.defaultRedBagChannelId,
    needTj: conf.isStopTJCoupon
  })
  const payload = Object.keys(presetPayload)
    .filter((k) => renderList.includes(k))
    .map((k) => adapter(presetPayload[k]))

  return payload[0] || adapter(presetPayload[0])
}

async function grabCoupon(gundamId) {
  const payload = await resolvePayload(gundamId)
  const res = await doPost('/gundam/gundamGrabV3', {
    data: {
      actualLatitude: '',
      actualLongitude: '',
      gundamId: gundamId,
      ...payload
    }
  })

  if (res.code == 0) return res.data

  if (res.code == 3) {
    throw { code: ECODE.AURH, api: 'gundamGrabV3', msg: res.msg || res.message }
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
    const userInfo = await getUserInfo()
    const gundamId = await getGundamId()
    const grabResult = await grabCoupon(gundamId)

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

module.exports = { getCoupons }
