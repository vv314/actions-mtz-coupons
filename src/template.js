import request from './request.js'

function extractAppJsUrl(text) {
  const regex = /https:\/\/[^"]*\/app[^"]*\.js/
  const match = text.match(regex)

  return match ? match[0] : null
}

async function getTemplateData(cookie, gundamId, guard) {
  const text = await request(
    `https://market.waimai.meituan.com/api/template/get?env=current&el_biz=waimai&el_page=gundam.loader&gundam_id=${gundamId}`
  ).then((rep) => rep.text())
  const matchGlobal = text.match(/globalData: ({.+})/)
  const appJs = extractAppJsUrl(text)

  try {
    const globalData = JSON.parse(matchGlobal[1])
    const renderList = await getRenderList(cookie, globalData, guard)

    return {
      gundamId,
      gdId: globalData.gdId,
      actName: globalData.pageInfo.title,
      appJs: appJs,
      pageId: globalData.pageId,
      renderList: renderList
    }
  } catch (e) {
    throw new Error(`活动配置数据获取失败: gdId: ${gundamId}, ${e}`)
  }
}

function getLocalRenderList(renderInfo) {
  if (renderInfo.status != 0 || !renderInfo?.componentRenderInfos) return []

  return filterRenderableKeys(renderInfo.componentRenderInfos)
}

function filterRenderableKeys(renderInfo) {
  return Object.entries(renderInfo)
    .filter(([_, v]) => v.render)
    .map(([k]) => k)
}

// 通过接口获取真实的渲染列表
async function getRenderList(
  cookie,
  { gundamViewId, gdId, pageId, renderInfo },
  guard
) {
  let data

  if (renderInfo) {
    const renderList = getLocalRenderList(renderInfo)

    if (renderList.length > 0) {
      return renderList
    }
  }

  try {
    const res = await request.get(
      'https://market.waimai.meituan.com/gd/zc/renderinfo',
      {
        params: {
          el_biz: 'waimai',
          el_page: 'gundam.loader',
          gundam_id: gundamViewId,
          gdId: gdId,
          pageId: pageId,
          tenant: 'gundam'
        },
        cookie,
        guard
      }
    )

    data = res.data
  } catch (e) {
    console.log(e)

    throw new Error('renderinfo 接口调用失败:' + e.message)
  }

  return filterRenderableKeys(data)
}

function matchMoudleData(text, start, end) {
  const reg = new RegExp(`${start}.+?(?=${end})`)

  const res = text.match(reg)

  if (!res) return null

  const data = eval(`({moduleId:"${res[0]})`)

  return data
}

export { getTemplateData, getRenderList, matchMoudleData }
