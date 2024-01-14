const ECODE = {
  SUCC: 0,
  AUTH: 1,
  API: 2,
  NETWOEK: 3,
  RUNTIME: 4
}

const mainActConf = { gid: '2KAWnD', name: '外卖红包天天领' }

// 抽奖活动
const lotteryActConfs = [
  { gid: '1VlhFT', name: '美团神会员' }
  // { gid: '2NjTfR', name: '公众号周三外卖节专属福利' }
]

// 神券活动
const gundamActConfs = [
  { gid: '4luWGh', name: '品质优惠天天领' },
  { gid: '4JZIgf', name: '冬日美食季' }
]

// 社群活动
const wxfwhActConfs = [
  // { gid: '1C0wLz', name: '天天神券服务号专属福利' },
  { gid: '1I9uL6', name: '社群专属福利' },
  { gid: '1HgnjG', name: '神奇福利社' }
]

export { ECODE, gundamActConfs, mainActConf, wxfwhActConfs, lotteryActConfs }
