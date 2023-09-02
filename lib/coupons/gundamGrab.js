import fetch from '../fetch.js'
import { getTemplateData } from '../template.js'
import getPayload from '../payload.js'
import { ECODE, HOST } from './const.js'

function getActUrl(gundamId) {
  return new URL(
    `https://market.waimai.meituan.com/gd/single.html?el_biz=waimai&el_page=gundam.loader&gundam_id=${gundamId}`
  )
}

function formatCoupons(coupons, actName) {
  return coupons.map((item) => ({
    name: item.couponName,
    etime: item.etime,
    amount: item.couponAmount,
    amountLimit: item.amountLimit,
    useCondition: item.useCondition,
    actName: actName
  }))
}

async function grabCoupon(cookie, gundamId) {
  const actUrl = getActUrl(gundamId)
  const tmplData = await getTemplateData(cookie, gundamId)
  const payload = await getPayload(tmplData.gdId, tmplData.appJs)
  const res = await fetch.post(`${HOST}/gundam/gundamGrabV4`, payload, {
    cookie,
    headers: {
      Origin: actUrl.origin,
      Referer: actUrl.origin + '/'
    }
  })

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
  grabCoupon: grabCoupon,
  getActUrl: getActUrl
}
export { getPayload }
