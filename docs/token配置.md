# TOKEN 配置

## 配置格式

`TOKEN` Secret 支持 `String` 和 `JSON` 对象两种配置格式。

### String 配置

快捷配置，值为从 `cookie` 中提取的 `token` 信息。

**示例:**

```
Js3xxxxFyy_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx
```

### JSON 配置

高级配置，适用于用户通知以及多账户支持。

#### 参数

| 属性名      | 类型   | 默认值 | 必填 | 说明                                                                                                                      |
| ----------- | ------ | ------ | ---- | ------------------------------------------------------------------------------------------------------------------------- |
| token       | string |        | 是   | 账号 token                                                                                                                |
| alias       | string |        | 否   | 账号别名，便于区分多账户                                                                                                  |
| qywxUid     | string |        | 否   | 企业微信通知，用户 id                                                                                                     |
| tgUid       | string |        | 否   | Telegram 通知，用户 id                                                                                                    |
| barkKey     | string |        | 否   | Bark 通知，推送 Key                                                                                                       |
| larkWebhook | string |        | 否   | 飞书通知，webhook 链接                                                                                                    |
| dtWebhook   | string |        | 否   | 钉钉通知，webhook 链接。当设置**加签**时，需按照`secret\|webhook` 的格式将 secret 拼接至 webhook 之前（两者以 `\|` 分隔） |
| qq          | string |        | 否   | Qmsg 通知，qq 号                                                                                                          |

_注意：企业微信通知需配置 `QYWX_SEND_CONF` Secret，Telegram 通知需配置 `TG_BOT_TOKEN` Secret，详见【消息通知】章节_

**示例:**

```json
{
  "token": "Js3xxxxFyy_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx",
  "qywxUid": "Vincent",
  "barkKey": "kkWwxxxq5NpWx"
}
```

## 多账户配置

当 `TOKEN` 指定为数组时，代表启用账户配置。每个配置成员均支持 `String` 和 `JSON` 格式。

**示例:**

```json
[
  "Js3xxxxFyy_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx",
  {
    "token": "3R2xxxxxUqS_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx",
    "alias": "fish",
    "barkKey": "kkWwxxxq5NpWx",
    "qywxUid": "Vincent"
  }
]
```
