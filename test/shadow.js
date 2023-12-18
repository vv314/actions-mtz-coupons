import ShadowGuard from '../src/shadow/index.js'
import grab from '../src/coupons/gundamGrab.js'
import { couponId } from '../src/coupons/const.js'

const guard = new ShadowGuard({
  dfpId: '8v0111yz74185w7deu38vz71222u80w981zvylws4779123469xu4399'
})

beforeAll(() => guard.init(grab.getActUrl(couponId.main.gid)))

test('Test Generate Session', () =>
  expect(guard.meta.sessionId).toHaveLength(32))

test('Test Generate Meta', () => expect(guard.meta).toBeTruthy())

test('Test Web FpId', async () => {
  const dfpId = await guard.getWebDfpId(guard.meta)

  return expect(dfpId).toHaveLength(56)
})

test('Test MtgSig', async () => {
  guard.context.timestamp = 1702734030440
  guard.context.runtimeKey = 'r0ejVfUUFC1DvZh3L/0z'
  guard.context.siua =
    'hs1.4A7RoRP0dbIKmoIPl+WUiTN8BQHkire5xDBjSCt4mtv1Ww6RzbqF4jv3nTk50BKzxmnmkBvEGU1suLA5Q1YoDrhGZ49LeB+Ze/XUZsCN6OhE='

  const { reqSig } = await guard.getReqSig({
    url: 'https://mediacps.meituan.com/gundam/gundamLogin',
    method: 'POST'
  })
  const mtgSig = await guard.getMtgSig(reqSig)

  expect(mtgSig).toBeTruthy()
})

test('Test Base Signature', async () => {
  const sig = await guard.getReqSig({
    url: 'https://mediacps.meituan.com/gundam/gundamLogin',
    method: 'POST'
  })

  expect(sig).toBeTruthy()
})

// test('Test Sign', async () => {
//   guard.context.timestamp = 1702733081884
//   guard.context.runtimeKey = 'JTpxAtixBnC7kIwLiTAJ'
//   guard.context.siua =
//     'hs1.4A7RoRP0dbIKmoIPl+WUiTIdW3GAXeT2B+TtjUmmfZwbxSDh9IjfHa6fH9OzcfHEQaU6O5d4nmk/Ugv/W0BIQoOpkKsAVi0kN3PlBhexONDA='

//   const { guardURL, reqSig } = await guard.getReqSig({
//     url: 'https://mediacps.meituan.com/gundam/gundamLogin',
//     method: 'POST'
//   })
//   const mtgSig = await guard.getMtgSig(reqSig)

//   guardURL.searchParams.append('mtgsig', JSON.stringify(mtgSig.data))

//   const sign = guardURL.toString()

//   expect(sign).toBeTruthy()
// })
