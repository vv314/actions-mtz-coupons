import request from '../request.js'
import {
  formatUrl,
  genMetaData,
  getH5Fp,
  getH5Dfp,
  getMtgSig,
  getReqSig
} from './guard.js'
import { guardVersion, csecPlatform, yodaReady } from './const.js'

class ShadowGuard {
  version = guardVersion
  h5fp = ''
  fingerprint = ''
  meta = {}

  constructor(opts) {
    this.context = {
      dfpId: opts?.dfpId,
      version: this.version
    }
  }

  async init(actUrl) {
    actUrl = actUrl instanceof URL ? actUrl.toString() : actUrl

    this.meta = await genMetaData(actUrl, this.version)
    this.fingerprint = await getH5Dfp(this.meta, this.version)
    this.h5fp = await getH5Fp(actUrl)

    if (!this.context.dfpId) {
      this.context.dfpId = await this.getWebDfpId(this.fingerprint)
    }

    this.meta.k3 = this.context.dfpId
    this.context.meta = this.meta

    return this
  }

  async getWebDfpId(fingerprint) {
    const res = await request.post(
      'https://appsec-mobile.meituan.com/v1/webdfpid',
      {
        data: fingerprint
      }
    )

    return res.data.dfp
  }

  async getReqSig(reqOpt) {
    const guardURL = new URL(formatUrl(reqOpt.url || ''))

    guardURL.searchParams.append('gdBs', '')
    guardURL.searchParams.append('yodaReady', yodaReady)
    guardURL.searchParams.append('csecplatform', csecPlatform)
    guardURL.searchParams.append('csecversion', this.version)
    reqOpt.url = guardURL.toString()

    const reqSig = await getReqSig(reqOpt)

    return { guardURL, reqSig }
  }

  async getMtgSig(reqSig, signType = 'url') {
    return getMtgSig(reqSig, {
      ...this.context,
      signType
    })
  }

  /**
   * @param {FetchOptions} reqOpt
   * @param {'url' | 'header'} signType
   * @returns
   */
  async sign(reqOpt, signType) {
    if (!reqOpt) return reqOpt

    const { guardURL, reqSig } = await this.getReqSig(reqOpt)
    const res = await this.getMtgSig(reqSig, signType)
    const mtgSig = JSON.stringify(res.data)
    const headers = {}

    if (signType === 'header') {
      headers.mtgsig = mtgSig
    } else {
      guardURL.searchParams.append('mtgsig', mtgSig)
    }

    return { url: guardURL.toString(), headers }
  }
}

export default ShadowGuard
