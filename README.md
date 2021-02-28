![外卖神券天天领](https://p0.meituan.net/dptakeaway/11b0b51183806e09f55a530fc0dd0409328863.jpg)

# 外卖神券天天领

> 超值红包享不停

外卖神券天天领，以自动化的方式定时领取美团外卖优惠券。

## 使用教程

### 获取活动 TOKEN

打开[红包活动页](https://activityunion-marketing.meituan.com/mtzcoupon/index.html)，登录后使用 Chrome DevTools 或任意抓包工具获取 cookie 信息，提取 `token` 字段值。

示例：

`token=Js3xxxxFyy_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx;`

### 部署

使用 [GitHub Actions](https://docs.github.com/cn/actions) 部署

1. 浏览器访问 [actions-mtwm-coupons](https://github.com/vv314/actions-mtwm-coupons)
   1. 点击右上角 `Star` 按钮 ;)
   2. 点击右上角 `Fork` 按钮
2. 在项目副本的 `Settings - Secrets` 中添加 `TOKEN`

工作流采用定时触发策略，脚本将在每日的 `11:05` 定时执行。

### 推送设置\*

在任务执行后推送通知

#### Bark (仅 iOS 支持)

手机 App Store 下载 [Bark App](https://apps.apple.com/cn/app/id1403753865)
Bark 将为每个设备将被分配一个唯一的推送 URL

```
URL 组成：host/:key/:body
示例: https://api.day.app/kkWwxxxq5NpWx/推送内容...

key: 推送 key，设备唯一标识
body: 推送内容
```

提取推送 `key`（本例为 `kkWwxxxq5NpWx`）
在项目的 `Settings - Secrets` 中添加 `BARK_KEY`
