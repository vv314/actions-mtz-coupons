const fetch = require('./fetch')

function resolveMetadata(renderInfo, jsText) {
  try {
    for (let id of renderInfo) {
      const reg = new RegExp(`red-envelope-${id}.+?(?=isOtherToAPP)`)
      const res = jsText.match(reg)

      if (res) return eval(`({id:"${res[0]}})`)
    }
  } catch (e) {
    return null
  }

  return null
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
          gdId: gundamId,
          tenant: 'gundam'
        }
      }
    )

    data = res.data
  } catch (e) {
    throw new Error('renderinfo 接口调用失败:' + e.message)
  }

  return Object.keys(data).filter((k) => data[k].render)
}

async function getPayload(gundamId, appJs) {
  const renderInfo = await getRenderInfo(gundamId)
  const jsText = await fetch(appJs).then((res) => res.text())
  const data = resolveMetadata(renderInfo, jsText)

  if (!data) {
    throw new Error('Payload 获取失败')
  }

  return {
    actualLatitude: '',
    actualLongitude: '',
    couponConfigIdOrderCommaString: data.priorityCouponIds.keys.join(','),
    defaultGrabKey: data.defaultRedBagChannelIdList.keys.join(',') || '',
    grabKey: data.redBagChannelIdList.keys.join(',') || '',
    gundamId: gundamId,
    needTj: data.isStopTJCoupon
  }
}

module.exports = getPayload
