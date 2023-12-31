import fetch from '../fetch.js'
import { dateFormat } from '../util/index.js'
import { getTemplateData, getRenderList, matchMoudleData } from '../template.js'
import { ECODE } from './const.js'

async function getPayload(gundamId, appJs, guard) {
  const renderList = await getRenderList(gundamId, guard)
  const jsText = await fetch(appJs).then((res) => res.text())
  let data = null

  try {
    for (const instanceId of renderList) {
      data = matchMoudleData(
        jsText,
        `gdc-fx-v2-netunion-red-envelope-${instanceId}`,
        'isStopTJCoupon'
      )

      if (data) {
        data.instanceID = instanceId
        data.isStopTJCoupon = true

        break
      }
    }
  } catch {
    // ignore
  }

  if (!data) {
    throw new Error('天天神券 Payload 生成失败')
  }

  return {
    actualLatitude: 0,
    actualLongitude: 0,
    app: -1,
    platform: 3,
    couponAllConfigIdOrderString: data.expandCouponIds.keys.join(','),
    couponConfigIdOrderCommaString: data.priorityCouponIds.keys.join(','),
    gundamId: gundamId,
    instanceId: data.instanceID,
    h5Fingerprint: '',
    rubikCouponKey: data.cubeToken || '',
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

    return match ? parseInt(match[1], 10) : null
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
  const { actName, appJs, gdId } = await getTemplateData(cookie, gundamId)
  const payload = await getPayload(gdId, appJs, guard)
  const res = await fetch.post(
    'https://mediacps.meituan.com/gundam/gundamGrabV4',
    payload,
    {
      cookie,
      headers: {
        Origin: actUrl.origin,
        Referer: actUrl.origin + '/'
      },
      guard
    }
  )

  if (res.code == 0) {
    return formatCoupons(res.data.coupons, actName)
  }

  const apiInfo = {
    api: 'gundamGrabV4',
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
  getPayload
}
