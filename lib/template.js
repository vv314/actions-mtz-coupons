import fetch from './fetch.js'

async function getTemplateData(cookie, gundamId) {
  const text = await fetch(
    `https://market.waimai.meituan.com/api/template/get?env=current&el_biz=waimai&el_page=gundam.loader&gundam_id=${gundamId}`,
    { cookie }
  ).then((rep) => rep.text())
  const matchGlobal = text.match(/globalData: ({.+})/)
  const matchAppJs = text.match(/https:\/\/[./_-\w]+app.*\.js(?=")/g)

  try {
    const globalData = JSON.parse(matchGlobal[1])

    return {
      gdId: globalData.gdId,
      actName: globalData.pageInfo.title,
      appJs: matchAppJs[0],
      pageId: globalData.pageId
    }
  } catch (e) {
    throw new Error(`活动配置数据获取失败: ${e}`)
  }
}

// 通过接口获取真实的渲染列表
async function getRenderList(gdId) {
  let data

  try {
    const res = await fetch.get(
      'https://market.waimai.meituan.com/gd/zc/renderinfo',
      {
        params: {
          el_biz: 'waimai',
          el_page: 'gundam.loader',
          gdId: gdId,
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

export { getTemplateData, getRenderList }
