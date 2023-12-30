import fetch from '../fetch.js'
import ShadowGuard from '../shadow/index.js'
import { createMTCookie, getUserInfo } from '../user.js'
import gundamGrab from './gundamGrab.js'
import { couponId, ECODE } from './const.js'

async function runTask(cookie, guard) {
  try {
    // 优先检测登录状态
    const userInfo = await getUserInfo(cookie, guard)
    const grabResult = []

    // 主活动，失败时向外抛出异常
    const mainResult = await gundamGrab.grabCoupon(
      cookie,
      couponId.main.gid,
      guard
    )

    grabResult.push(...mainResult)

    // try {
    //   const qualityShopResult = await gundamGrab.grabCoupon(
    //     cookie,
    //     couponId.shop.gid,
    //     guard
    //   )

    //   grabResult.push(...qualityShopResult)
    // } catch {
    //   // 仅对某些用户群体生效
    // }

    return {
      code: ECODE.SUCC,
      data: {
        userInfo,
        coupons: grabResult
      },
      msg: '成功'
    }
  } catch (e) {
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
      case fetch.ECODE.TIMEOUT:
      case fetch.ECODE.NETWOEK:
        code = ECODE.NETWOEK
        msg = '网络异常'
        break
      default:
        code = ECODE.RUNTIME
        msg = '程序异常'
    }

    return { code, msg, error: e }
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

  // 优先设置代理
  if (httpProxy) {
    fetch.setProxyAgent(httpProxy)
  }

  const cookieJar = createMTCookie(token)

  // 在 main 之外获取 guard，避免重复初始化
  const guard = await new ShadowGuard().init(
    gundamGrab.getActUrl(couponId.main.gid)
  )

  async function main(retryTimes = 0) {
    const result = await runTask(cookieJar, guard)
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

export { getCoupons, ECODE }
