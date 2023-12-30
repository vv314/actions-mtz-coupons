import fetch from '../fetch.js'
import { getRenderList, getTemplateData } from '../template.js'
import { ECODE } from './const.js'

const gundamId = '1VlhFT'
const fetchStatus = {
  CAN_FETCH: 0,
  FETCH_ALREADY: 1,
  OUT_OF_STOCK: 2,
  INVALID_USER_TYPE: 3,
  CANNOT_FETCH: 4,
  FETCHED_BY_UUID: 5
}

function getActUrl(gundamId) {
  return new URL(
    `https://market.waimai.meituan.com/gd2/single.html?el_biz=waimai&el_page=gundam.loader&tenant=gundam&gundam_id=${gundamId}`
  )
}

function resolveMetadata(renderList, jsText) {
  try {
    for (const instanceId of renderList) {
      const regRedMod = new RegExp(
        `gdc-new-ticket-wall-${instanceId}.+?(?=openUserCheck)`
      )
      const res = jsText.match(regRedMod)

      if (res) {
        const data = eval(`({moduleId:"${res[0]}})`)

        data.instanceId = instanceId

        return data
      }
    }
  } catch (e) {
    return null
  }

  return null
}

async function getTicketConfig(gdId, appJs) {
  const renderList = await getRenderList(gdId)
  const jsText = await fetch(appJs).then((res) => res.text())
  const data = resolveMetadata(renderList, jsText)
  const ticketConfig = data.ticketConfig.makeOptions1.ticketInfo1

  return {
    ...ticketConfig,
    instanceId: data.instanceId
  }
}

async function getParams(gdId, channelUrl, instanceId) {
  return {
    couponReferId: channelUrl,
    actualLng: 0,
    actualLat: 0,
    geoType: 2,
    versiom: 1,
    isInDpEnv: 0,
    gdPageId: gdId,
    instanceId: instanceId
  }
}

function formatCoupons(coupons, info) {
  return coupons.map((item) => ({
    name: item.couponName,
    etime: item.couponEndTime,
    amount: item.couponValue,
    amountLimit: item.priceLimit,
    useCondition: info.useCondition ?? '',
    actName: info.actName
  }))
}

async function getLotteryInfo(cookie, couponIds) {
  const res = await fetch.get(
    `https://promotion.waimai.meituan.com/lottery/couponcomponent/info/v2`,
    {
      cookie,
      params: {
        couponReferIds: couponIds.join(','),
        actualLng: 0,
        actualLat: 0,
        geoType: 2,
        sceneId: 1,
        isInDpEnv: 0,
        cType: 'wm_wxapp'
      }
    }
  )
  const couponList = res.data.couponList.filter(
    (data) =>
      data.status === fetchStatus.CAN_FETCH ||
      data.status === fetchStatus.FETCH_ALREADY
  )

  return couponList
}

async function grabCoupon(cookie) {
  const actUrl = getActUrl(gundamId)
  const tmplData = await getTemplateData(cookie, gundamId)
  const ticketConfig = await getTicketConfig(tmplData.gdId, tmplData.appJs)
  const lotteryCoupons = await getLotteryInfo(cookie, [
    ticketConfig.channelUrl ?? ''
  ])
  const results = []

  for (const coupon of lotteryCoupons) {
    if (coupon.status === fetchStatus.FETCH_ALREADY) {
      results.push(coupon)

      continue
    }

    const res = await fetch.post(
      `https://promotion.waimai.meituan.com/lottery/couponcomponent/fetchcomponentcoupon/v2`,
      {
        appVersion: '',
        cType: 'wm_wxapp',
        fpPlatform: 3,
        mtFingerprint: '',
        wxOpenId: ''
      },
      {
        cookie,
        params: {
          couponReferId: coupon.couponReferId,
          actualLng: 0,
          actualLat: 0,
          geoType: 2,
          version: 1,
          isInDpEnv: 0,
          gdPageId: tmplData.gdId,
          pageId: tmplData.pageId,
          instanceId: ticketConfig.instanceId ?? '',
          sceneId: 1
        },
        headers: {
          mtgsig: '{}',
          Origin: actUrl.origin,
          Referer: actUrl.origin + '/'
        }
      }
    )

    if (res.code == 0) {
      results.push(coupon)
    } else {
      // console.log('抢券失败', res)
    }
  }

  return formatCoupons(results, {
    actName: tmplData.actName,
    useCondition: ticketConfig.desc
  })
}

export default {
  grabCoupon,
  getActUrl
}
export { getParams }
