# 获取 Token

打开[美团个人主页](https://i.meituan.com/mttouch/page/account)，登录后使用 Chrome 开发者工具，或任意抓包工具获取 cookie 信息，提取 `token` 字段值。

## 使用 Chrome 开发者工具

1. 打开 Chrome 开发者工具，切换至移动设备调试模式
2. 打开[美团个人主页](https://i.meituan.com/mttouch/page/account)，登录账号
3. 在 Chrome 开发者工具中点击 “应用” - “Cookie”，搜索 “token”

![Chrome DevTools](https://github.com/vv314/actions-mtz-coupons/assets/7637375/6677e9a8-95b8-4b96-83c2-33e443e26e36)

**示例：**

```
Js3xxxxFyy_Aq-rOnxMtw6vKPV4AAAAA6QwAADgqRBSfcmNqyu777Q7JDL7xxxxNGbfF7tPNV5347_ANLcydac_MTWMTTL_xx
```
