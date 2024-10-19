import request from '../request.js'
import { getTemplateData } from '../template.js'

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

async function getTicketConfig(appJs, renderList) {
  const jsText = await request(appJs).then((res) => res.text())
  const data = resolveMetadata(renderList, jsText)
  const ticketConfig = data.ticketConfig.makeOptions1.ticketInfo1

  return {
    ...ticketConfig,
    instanceId: data.instanceId
  }
}

async function getPayload({ referId, gdId, pageId, instanceId }, guard) {
  const query = {
    couponReferId: referId,
    actualLng: 0,
    actualLat: 0,
    geoType: 2,
    version: 1,
    isInDpEnv: 0,
    gdPageId: gdId,
    pageId: pageId,
    instanceId: instanceId ?? '',
    sceneId: 1
  }
  const body = {
    appVersion: '',
    cType: 'wm_wxapp',
    fpPlatform: 3,
    mtFingerprint: guard.fingerprint,
    wxOpenId: ''
  }

  return { body, query }
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

async function getCouponList(cookie, couponIds) {
  const res = await request.get(
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

  return res.data.couponList
}

async function grabCoupon(cookie, gundamId, guard) {
  const actUrl = getActUrl(gundamId)
  const tmplData = await getTemplateData(cookie, gundamId)
  const ticketConfig = await getTicketConfig(
    tmplData.appJs,
    tmplData.renderList
  )
  const couponList = await getCouponList(cookie, [
    ticketConfig.channelUrl ?? ''
  ])
  const availCoupons = couponList.filter((coupon) =>
    [fetchStatus.CAN_FETCH].includes(coupon.status)
  )
  const results = Promise.all(
    availCoupons
      .map(async (coupon) => {
        const payload = getPayload(
          {
            referId: coupon.couponReferId,
            gdId: tmplData.gdId,
            pageId: tmplData.pageId,
            instanceId: ticketConfig.instanceId
          },
          guard
        )
        const res = await request.post(
          `https://promotion.waimai.meituan.com/lottery/couponcomponent/fetchcomponentcoupon/v2`,
          payload.body,
          {
            cookie,
            params: payload.query,
            headers: {
              mtgsig: '{}',
              Origin: actUrl.origin,
              Referer: actUrl.origin + '/'
            }
          }
        )

        if (res.code == 0) {
          return coupon
        }

        return null
      })
      .filter(Boolean)
  )

  return formatCoupons(results, {
    actName: tmplData.actName,
    useCondition: ticketConfig.desc
  })
}

export default {
  grabCoupon,
  getActUrl,
  getCouponList,
  getPayload,
  getTicketConfig,
  getTemplateData
}
