const ECODE = {
  SUCC: 0,
  AUTH: 1,
  API: 2,
  NETWOEK: 3,
  RUNTIME: 4
}
const HOST = 'https://mediacps.meituan.com'

const couponId = {
  main: { gid: '2KAWnD', name: '外卖红包' },
  shop: { gid: '4luWGh', name: '品质优惠天天领' }
  // { gid: '1VlhFT', aid: '443084', name: '周末小吃街' }
}

export { couponId, ECODE, HOST }
