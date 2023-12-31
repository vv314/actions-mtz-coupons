import fetch from '../fetch.js'
import { dateFormat, groupBy } from '../util/index.js'
import { getTemplateData, matchMoudleData } from '../template.js'
import { ECODE } from './const.js'

/* 服务号专属活动 */

function getActUrl(gundamId) {
  return new URL(
    `https://market.waimai.meituan.com/gd/single.html?el_biz=waimai&el_page=gundam.loader&gundam_id=${gundamId}`
  )
}

function formatCoupons(coupons, actName) {
  return coupons.map((item) => {
    const etime =
      typeof item.couponEndTime === 'number'
        ? dateFormat(item.couponEndTime)
        : item.couponEndTime

    return {
      name: item.couponName,
      etime: etime,
      amount: item.couponValue,
      amountLimit: item.priceLimit,
      useCondition: '',
      actName: actName ?? ''
    }
  })
}

async function getCouponList(cookie, viewId) {
  const res = await fetch.get(
    'https://promotion.waimai.meituan.com/playcenter/generalcoupon/info',
    {
      params: {
        activityViewId: viewId
      },
      cookie
    }
  )

  if (res.code != 0) {
    throw new Error('服务号红包信息获取失败')
  }

  return res.data.couponList
}

async function getPayloadTabs(cookie, viewId) {
  const couponList = await getCouponList(cookie, viewId)
  const tabs = Object.entries(groupBy(couponList, 'planCode')).map(
    ([planCode, coupons]) => ({
      planCode,
      rightCodes: coupons
        .filter((item) => item.status === 0)
        .map((item) => item.rightCode)
    })
  )

  return tabs.filter((item) => item.rightCodes.length)
}

async function getPayload(
  cookie,
  { gdId, pageId, renderList, appJs, fingerprint }
) {
  const jsText = await fetch(appJs).then((res) => res.text())
  let data = null

  try {
    for (const instanceId of renderList) {
      const modData = matchMoudleData(
        jsText,
        `gdc-gd-cross-ticket-wall-${instanceId}`,
        'materialConfig'
      )

      if (modData) {
        data = {
          instanceId,
          viewId: modData.ticketConfig.playActivityId
        }

        break
      }
    }
  } catch {
    // ignore
  }

  if (!data) {
    throw new Error('服务号 Payload 生成失败')
  }

  const tabs = await getPayloadTabs(cookie, data.viewId)

  return {
    ctype: 'wm_wxapp',
    fpPlatform: 13,
    wxOpenId: '',
    appVersion: '',
    activityViewId: data.viewId,
    tabs: tabs,
    gdId: gdId,
    pageId: pageId,
    instanceId: data.instanceId,
    mtFingerprint: fingerprint
  }
}

async function grabCoupon(cookie, gundamId, guard) {
  const actUrl = getActUrl(gundamId)
  const { actName, gdId, pageId, renderList, appJs } = await getTemplateData(
    cookie,
    gundamId
  )
  const payload = await getPayload(cookie, {
    gdId,
    pageId,
    renderList,
    appJs,
    fingerprint: guard.fingerprint
  })

  if (!payload.tabs.length) {
    return []
  }

  const res = await fetch.post(
    'https://promotion.waimai.meituan.com/playcenter/generalcoupon/fetch',
    payload,
    {
      cookie,
      params: {
        isMini: 1,
        ctype: 'wm_wxapp',
        isInDpEnv: 0,
        pageId: payload.pageId,
        gdPageId: payload.gdId,
        instanceId: payload.instanceId
      },
      headers: {
        Origin: actUrl.origin,
        Referer: actUrl.origin + '/'
      },
      guard
    }
  )

  if (res.code == 0) {
    return formatCoupons(res.data.couponList, actName)
  }

  const apiInfo = {
    api: 'generalcoupon/fetch',
    name: actName,
    msg: res.msg || res.message
  }

  if (res.code == 3) {
    throw { code: ECODE.AUTH, ...apiInfo }
  }

  throw { code: ECODE.API, ...apiInfo }
}

export default {
  grabCoupon,
  getActUrl,
  getPayload,
  getCouponList
}
