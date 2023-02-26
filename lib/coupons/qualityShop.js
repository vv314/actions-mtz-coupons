import fetch from '../fetch.js'
import getPayload from '../payload.js'
import { ECODE, HOST } from './const.js'

const GUNDAM_ID = '4luWGh'
const actUrl = new URL(
  `https://market.waimai.meituan.com/gd/single.html?el_biz=waimai&el_page=gundam.loader&gundam_id=${GUNDAM_ID}`
)

async function getTemplateData() {
  const text = await fetch(
    `https://market.waimai.meituan.com/api/template/get?env=current&el_biz=waimai&el_page=gundam.loader&gundam_id=${GUNDAM_ID}`
  ).then((rep) => rep.text())
  const matchGlobal = text.match(/globalData: ({.+})/)
  const matchAppJs = text.match(/https:\/\/[./_-\w]+app.+?\.js(?=")/g)

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

async function grabCoupon(cookie) {
  const tmplData = await getTemplateData(cookie)
  const payload = await getPayload(tmplData.gundamId, tmplData.appJs)
  const res = await fetch.post(`${HOST}/gundam/gundamGrabV4`, payload, {
    cookie,
    headers: {
      Origin: actUrl.origin,
      Referer: actUrl.origin + '/'
    }
  })

  if (res.code == 0) return res.data

  if (res.code == 3) {
    throw { code: ECODE.AUTH, api: '品质商家', msg: res.msg || res.message }
  }

  throw { code: ECODE.API, api: '品质商家', msg: res.msg || res.message }
}

export default {
  grabCoupon: grabCoupon,
  getActUrl: () => actUrl
}
