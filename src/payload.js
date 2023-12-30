import fetch from './fetch.js'
import { getRenderList } from './template.js'

function matchMoudleData(id, jsText) {
  const endField = 'isStopTJCoupon'
  const reg = new RegExp(
    `gdc-fx-v2-netunion-red-envelope-${id}.+?(?=${endField})`
  )

  const res = jsText.match(reg)

  if (!res) return null

  const data = eval(`({moduleId:"${res[0]}})`)

  return data
}

function resolveMetadata(renderList, jsText) {
  try {
    for (const instanceId of renderList) {
      const data = matchMoudleData(instanceId, jsText)

      if (!data) continue

      data.instanceID = instanceId
      data.isStopTJCoupon = true

      return data
    }
  } catch (e) {
    return null
  }

  return null
}

async function getGundamPayload(gundamId, appJs, guard) {
  const renderList = await getRenderList(gundamId, guard)
  const jsText = await fetch(appJs).then((res) => res.text())
  const data = resolveMetadata(renderList, jsText)

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

export default getGundamPayload
