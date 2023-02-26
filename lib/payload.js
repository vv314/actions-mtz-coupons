import fetch from './fetch.js'

function parseInstanceID(moduleId) {
  const regFloat = /(\d+\.\d+)/

  return moduleId.match(regFloat)?.[1] ?? ''
}

function resolveMetadata(renderInfo, jsText) {
  try {
    for (const id of renderInfo) {
      const regRedMod = new RegExp(`red-envelope-${id}.+?(?=isOtherToAPP)`)
      const res = jsText.match(regRedMod)

      if (res) {
        const data = eval(`({moduleId:"${res[0]}})`)

        data.instanceID = data.instanceID ?? parseInstanceID(data.moduleId)

        return data
      }
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

export default getPayload
