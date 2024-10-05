import fetch from '../fetch.js'
import { dateFormat } from '../util/index.js'
import { getTemplateData, matchMoudleData } from '../template.js'
import { ECODE } from './const.js'

function resolveRedMod(text, renderList) {
  try {
    for (const instanceId of renderList) {
      const data = matchMoudleData(
        text,
        `gdc-fx-v2-netunion-red-envelope-${instanceId}`,
        ',directives'
      )

      if (data) {
        data.instanceID = instanceId

        return data
      }
    }
  } catch {
    // ignore
  }

  return null
}

async function getPayload({ gundamId, gdId, appJs, renderList }) {
  const jsText = await fetch(appJs).then((res) => res.text())
  const data = resolveRedMod(jsText, renderList)

  if (!data) {
    throw new Error(`[${gundamId}] Gundam Payload 生成失败`)
  }

  return {
    actualLatitude: 0,
    actualLongitude: 0,
    ctype: 'h5',
    app: -1,
    platform: 3,
    couponAllConfigIdOrderString: data.expandCouponIds.keys.join(','),
    couponConfigIdOrderCommaString: data.priorityCouponIds.keys.join(','),
    // 这里取 number 类型的 gdId
    gundamId: gdId,
    instanceId: data.instanceID,
    h5Fingerprint:
      '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',
    needTj: data.isStopTJCoupon
  }
}

function getActUrl(gundamId) {
  return new URL(
    `https://market.waimai.meituan.com/gd/single.html?el_biz=waimai&el_page=gundam.loader&gundam_id=${gundamId}`
  )
}

function formatCoupons(coupons, actName) {
  function extractNumber(text) {
    const match = text.match(/满(\d+)可用/)

    return match ? parseInt(match[1], 10) : 0
  }

  return coupons.map((item) => {
    const etime =
      typeof item.etime === 'number' ? dateFormat(item.etime) : item.etime
    const amountLimit = extractNumber(item.amountLimit)

    return {
      name: item.couponName,
      etime,
      amount: item.couponAmount,
      amountLimit,
      useCondition: item.useCondition,
      actName: actName
    }
  })
}

async function grabCoupon(cookie, gundamId, guard) {
  const actUrl = getActUrl(gundamId)
  const tmplData = await getTemplateData(cookie, gundamId, guard)
  const payload = await getPayload(tmplData)
  const res = await fetch.post(
    'https://mediacps.meituan.com/gundam/gundamGrabV4',
    payload,
    {
      cookie,
      headers: {
        Origin: actUrl.origin,
        Referer: actUrl.origin + '/'
      },
      signType: 'header',
      guard
    }
  )

  if (res.code == 0) {
    return formatCoupons(res.data.coupons, tmplData.actName)
  }

  const apiInfo = {
    api: 'gundamGrabV4',
    name: tmplData.actName,
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
  getPayload
}
