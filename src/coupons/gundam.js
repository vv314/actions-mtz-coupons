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
