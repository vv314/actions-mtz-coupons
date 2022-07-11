const fetch = require("../fetch")

const baseApi = 'https://mediacps.meituan.com'

async function doPost(api, opts = {}) {
  const url = api.startsWith('http') ? api : baseApi + api

  return fetch.post(url, opts.data, {
    headers: {
      // 重要：需设置 UA
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Mobile/15E148 Safari/604.1',
      ...(opts.headers || {}),
    }
  })
}
module.exports = {
  doPost,
  baseApi
}
