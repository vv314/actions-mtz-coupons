![外卖神券天天领](https://p0.meituan.net/dptakeaway/11b0b51183806e09f55a530fc0dd0409328863.jpg)

# 🧧【美团】外卖神券天天领

![workflow](https://img.shields.io/github/actions/workflow/status/vv314/actions-mtz-coupons/grab-coupon.yml?branch=main&label=%E9%A2%86%E7%BA%A2%E5%8C%85&logo=github%20actions&style=flat) ![release](https://img.shields.io/github/v/release/vv314/actions-mtz-coupons) ![update](https://img.shields.io/github/last-commit/vv314/actions-mtz-coupons/main?label=update) ![fork](https://img.shields.io/github/forks/vv314/actions-mtz-coupons)

外卖神券天天领，超值红包享不停；以自动化的方式领取美团红包。

> ★ 专注领劵，不搞杂七杂八<br/>★ 多帐号支持，全村都能配上<br/>★ 并行化任务，数管齐下更有效率<br/>★ 异常重试，一次不行再来一次<br/>★ 多路消息通知，总有一个到达你<br/>★ Github Actions 部署，从未如此简单

## 一、📕 使用手册

#### 获取账号 TOKEN

打开[美团主页](http://i.meituan.com/)，登录后使用 Chrome DevTools 或任意抓包工具获取 cookie 信息，提取 `token` 字段值。

示例：

```
token=Js3xxxxFyy_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx;
```

### 1.1 🚀 部署

使用 [GitHub Actions](https://docs.github.com/cn/actions) 部署：

1. Fork 源项目
   1. 访问 [actions-mtz-coupons](https://github.com/vv314/actions-mtz-coupons) 源仓库
   2. 点击右上角 `Star` 按钮 ;)
   3. 点击右上角 `Fork` 按钮
2. 添加 Actions secrets
   1. 导航到 Fork 后的仓库主页面
   2. 在仓库菜单栏中，点击 `⚙️Settings`（设置）
   3. 点击侧边栏 `Secrets and variables` - `Actions` 条目
   4. 点击 `New repository secret` 创建仓库密码
      1. 在 `Name` 输入框中填入 `TOKEN`
      2. 在 `Value` 输入框中填入从 cookie 中提取的 token 值（详见下文 TOKEN 配置）
   5. 点击 `Add secret` 保存配置

_Fork 后的项目可执行 `npm run sync` 同步上游更新，详细参考【脚本更新】章节_

#### 脚本触发方式

Github Actions 工作流支持**手动**与**自动**两种触发方式

- 自动触发，每日 `11:00` 前定时执行（已开启）
- 手动触发
  - [在项目主页上调用](https://docs.github.com/cn/actions/managing-workflow-runs/manually-running-a-workflow#)
  - [使用 REST API 调用](https://docs.github.com/cn/rest/reference/actions#create-a-workflow-dispatch-event)

### 1.2 🔏 TOKEN 配置

`TOKEN` Secret 支持 `String` 或 `JSON` 对象两种数据格式：

- String 类型 - 简单配置，值为 cookie 中提取的 token 信息
- JSON 类型 - 高级配置，适用于一对一推送以及多账户支持

当 `TOKEN` 为 `JSON` 类型时，应包含以下属性：

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

String 配置示例:

```
Js3xxxxFyy_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx
```

JSON 配置示例:

```json
{
  "token": "Js3xxxxFyy_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx",
  "qywxUid": "Vincent",
  "barkKey": "kkWwxxxq5NpWx"
}
```

#### 多账户配置

当 `TOKEN` 指定为数组时，代表启用账户配置。每个配置成员均支持 `String` 和 `JSON` 格式。

配置示例:

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

### 1.3 🔔 消息通知

发送消息推送，通知程序运行结果。按照通知类型分为**用户通知**和**全局通知**：

- 用户通知：一对一推送，适用于多账户内的“乘客”
- 全局通知：推送所有任务的执行情况，适用于程序管理者

支持平台：

|           | 用户通知 | 全局通知 | 备注                                             |
| --------- | :------: | :------: | ------------------------------------------------ |
| Bark      |    ✅    |    ✅    | 仅 iOS 支持                                      |
| 飞书      |    ✅    |    ✅    |                                                  |
| 钉钉      |    ✅    |    ✅    |                                                  |
| Telegram  |    ✅    |    ✅    |                                                  |
| 企业微信  |    ✅    |    ✅    |                                                  |
| Server 酱 |          |    ✅    |                                                  |
| pushplus  |          |    ✅    |                                                  |
| Qmsg 酱   |    ☑️    |    ✅    | 平台方对非捐赠版有频次限制，将影响多账户通知通能 |

消息模板示例：

```
【外卖神券天天领😋】
账号 xxx:
- ￥5（满20可用）
- ￥7（满35可用）
- ￥3（满20可用）

账号 xxx:
- ￥5（满20可用）
- ￥7（满35可用）
...
```

#### 1.3.1 Bark

[Bark](https://apps.apple.com/cn/app/id1403753865) 是一款可以接收自定义通知的 iOS 应用

<details>
<summary><em>获取推送 key</em></summary>

打开 Bark App 查看推送 url：

```
URL 组成：host/:key/:body
示例: https://api.day.app/kkWwxxxq5NpWx/推送内容...

host: 服务域名
key: 推送 key，设备唯一标识
body: 自定义推送内容
```

提取推送 `key`，本例为 `kkWwxxxq5NpWx`

</details>

##### 用户通知配置

`TOKEN` Secret 配置为 JSON 格式，添加 `barkKey` 属性，填入推送 key。

##### 全局通知配置

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `BARK_KEY` 项，填入推送 key

#### 1.3.2 飞书

[飞书](https://www.feishu.cn/)是字节跳动旗下先进企业协作与管理平台，提供一站式的无缝办公协作能力。

<details>
<summary><em>创建飞书捷径</em></summary>

1. 打开[飞书应用目录](https://app.feishu.cn/)，选择 "企业服务" → "连接器" → "[飞书捷径](https://app.feishu.cn/app/cli_9c2e4621576f1101)"，点击“获取”（使用）按钮安装应用
2. 打开[飞书捷径](https://applink.feishu.cn/client/app_share/open?appId=cli_9c2e4621576f1101)应用，在 “按应用查看模板” 栏目筛选 “webhook”，选择使用 “webhook 收到请求时通知”
3. 配置 webhook 捷径
   1. 点击 "Catch hook" 卡片
      - 复制保存 `webhook 地址`(例：https://www.feishu.cn/flow/api/trigger-webhook/3391dxxxxx60a2d5xxxxx2073b3xxxxx)
      - 在`参数`项，填入以下内容：
      ```json
      {
        "mtz": {
          "title": "外卖神券天天领",
          "content": "hello world!"
        }
      }
      ```
   2. 点击“通过飞书捷径机器人发送消息”卡片
      - 在 `消息标题` 项，清空已有内容，点击右侧加号按钮选择 `mtz.title`
      - 在 `消息内容` 项，清空已有内容，点击右侧加号选择 `mtz.content`
   3. 点击“保存”按钮应用配置

</details>

##### 用户通知配置

`TOKEN` Secret 配置为 JSON 格式，添加 `larkWebhook` 属性，填入`webhook 地址`。

##### 全局通知配置

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `LARK_WEBHOOK` 项，填入`webhook 地址`

#### 1.3.3 钉钉

[钉钉](https://www.dingtalk.com/)是由阿里巴巴集团开发的智能移动办公平台，用于商务沟通和工作协同。

**注意：当设置 “加签” 时，需按照`secret\|webhook` 的格式将 secret 拼接至 webhook 之前（两者以 `|` 分隔）**

<details>
<summary><em>创建钉钉机器人*</em></summary>

1. [创建](https://oa.dingtalk.com/register_new.htm)一个团队（群聊）
2. 打开 PC 端钉钉，在群设置中选择 “智能群助手” → “添加机器人” → “自定义”
3. 填写机器人自定义名称，配置安全设置。安全设置支持以下两种方式：
   1. 自定义关键词：填入 `外卖`
   2. 加签
4. 复制 webhook 地址

</details>

##### 用户通知配置

`TOKEN` Secret 配置为 JSON 格式，添加 `dtWebhook` 属性，填入`webhook 地址`。

##### 全局通知配置

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `DINGTALK_WEBHOOK` 项，填入`webhook 地址`

#### 1.3.4 Telegram

[Telegram](https://telegram.org) 是一款跨平台的专注于安全和速度的聊天软件。通过创建 Telegram Bot，可发送自定义通知。

<details>
<summary><em>创建 Telegram Bot*</em></summary>

1. Telegram 搜索 [@BotFather](https://t.me/botfather)，点击 `/start` 启用 bot
2. 点击 `/newbot` 创建自定义 bot
   1. 输入 bot 昵称
   2. 输入 bot id（需全局唯一），以 `_bot` 结尾，例：`test233_bot`
3. 创建成功后，将会返回你的 bot token（例：`1689581149:AAGYVVjEHsaNxxxT8eQxxxshwr2o4Pxxxu86`）
4. Telegram 搜索刚刚创建的 bot id（本例: `test_bot`），点击 `/start` 启用 bot

##### 获取 Bot Token

Telegram 搜索 [@BotFather](https://t.me/botfather)，点击 `/mybots`，获取 bot token

##### 获取用户 ID

Telegram 搜索 [@userinfobot](https://t.me/useridinfobot)，点击 `/start`，获取用户 ID。

</details>

##### 配置 Bot Token

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `TG_BOT_TOKEN` 项，填入 bot token

##### 用户通知配置

`TOKEN` Secret 配置为 JSON 格式，添加 `tgUid` 属性，填入用户 ID。

##### 全局通知配置

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `TG_USER_ID` 项，填入用户 ID

#### 1.3.5 企业微信

[企业微信](https://work.weixin.qq.com) 是微信团队出品的企业通讯与办公应用，具有与微信互联的能力。

<details>
<summary><em>创建企业微信应用*</em></summary>

1. PC 端打开[企业微信官网](https://work.weixin.qq.com/)，注册一个企业
2. 注册完成后，进入“[应用管理](https://work.weixin.qq.com/wework_admin/frame#apps)” → “应用” → “自建”，点击 `➕创建应用`
3. 完善应用名称与 logo 信息，可见范围选择公司名

##### 获取应用信息

进入企业微信管理后台：

1. “[我的企业](https://work.weixin.qq.com/wework_admin/frame#profile)” → “企业信息” 下获取 “企业 ID”
2. “[应用管理](https://work.weixin.qq.com/wework_admin/frame#apps)” → “应用” → “自建”，点进目标应用，获取 `AgentId`（应用 ID）
3. “[应用管理](https://work.weixin.qq.com/wework_admin/frame#apps)” → “应用” → “自建”，点进目标应用，获取 `Secret`（应用钥匙）

</details>

##### 配置企业微信通知

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `QYWX_SEND_CONF` 项，填入 **\<JSON 配置>**

**JSON 配置**字段说明:

| 属性名     | 类型   | 默认值            | 必填 | 说明                      |
| ---------- | ------ | ----------------- | ---- | ------------------------- |
| corpId     | string |                   | 是   | 企业 ID                   |
| agentId    | string |                   | 是   | 应用 ID                   |
| corpSecret | string |                   | 是   | 应用密匙                  |
| toUser     | string | @all （推送所有） | 否   | 用户 ID，多用户以 \| 分割 |

示例：

```json
{
  "corpId": "wwxxxe9ddxxxc50xxx",
  "agentId": "1000002",
  "corpSecret": "12Qxxxo4hxxxyedtxxxdyfVxxxCqh6xxxF0zg3xxxNI",
  "toUser": "@all"
}
```

##### 用户通知配置

`TOKEN` Secret 配置为 JSON 格式，添加 `qywxUid` 属性

##### 全局通知配置

`QYWX_SEND_CONF` Secret 设置 `toUser` 属性

#### 1.3.6 Server 酱（仅支持全局通知）

[Server 酱](https://sct.ftqq.com) 是一款从服务器、路由器等设备上推消息到手机的工具。

<details>
<summary><em>获取 SendKey</em></summary>

打开 Server 酱 [SendKey](https://sct.ftqq.com/sendkey) 页面，获取 `SendKey`

</details>

##### 全局通知配置

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `SC_SEND_KEY` 项，填入 `SendKey`

#### 1.3.7 pushplus（仅支持全局通知）

[pushplus](https://www.pushplus.plus/) 推送加。是一个集成了微信、企业微信、钉钉、短信、邮件等渠道的信息推送平台。

<details>
<summary><em>获取 pushplus token</em></summary>

进入 [pushplus 官网](https://www.pushplus.plus/push1.html)，登录后获取 pushplus `token`

</details>

##### 全局通知配置

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `PUSHPLUS_TOKEN` 项，填入 `token`

#### 1.3.8 Qmsg 酱

[Qmsg 酱](https://qmsg.zendee.cn/) 是一个 QQ 消息推送平台。

<details>
<summary><em>获取 qmsg key</em></summary>
  
进入 Qmsg 酱[管理台](https://qmsg.zendee.cn/me.html)。登录后获取推送 `key`
</details>

##### 配置 qmsg key

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `QMSG_KEY` 项，填入 `key`

##### 用户通知配置

`TOKEN` Secret 配置为 JSON 格式，添加 `qq` 属性，填入用户 qq 号。

##### 全局通知配置

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `QMSG_ADMIN` 项，填入 qq 号

## 二、🔄 脚本更新

此项目将长期维护，为了确保副本能够及时享受到上游更新，请定期执行同步操作。

### 2.1 使用命令同步（推荐）

执行 npm script：

```bash
npm run sync
```

脚本执行后会拉取上游仓库的最新主分支代码，与本地主分支进行合并，最后合并结果同步到远程仓库。

### 2.2 手动同步

参考 Github 官方文档 [同步复刻](https://docs.github.com/cn/github/collaborating-with-issues-and-pull-requests/syncing-a-fork)

## 三、🛠 开发与测试

为了便于调试，项目使用 [dotenv](https://github.com/motdotla/dotenv) 储存本地配置，在项目根目录下创建 `.env` 文件，填入 `Secrets` 信息。

示例:

```bash
# 美团 cookie token
TOKEN=token=Js3xxxxFyy_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx;
# bark 推送 key
BARK_KEY=kkWwxxxq5NpWx
# telegram bot token
TG_BOT_TOKEN=1689581149:AAGYVVjEHsaNxxxT8eQxxxshwr2o4Pxxxu86
# telegram 用户 ID
TG_USER_ID=100000000
# server 酱 SendKey
SC_SEND_KEY=SCTxxxxxTPIvAYxxxxxXjGGzvCfUxxxxxx
# 企业微信配置
QYWX_SEND_CONF={"agentId": "1000002", "corpId": "wwxxxe9ddxxxc50xxx", "corpSecret": "12Qxxxo4hxxxyedtxxxdyfVxxxCqh6xxxF0zg3xxxNI", "toUser": "@all"}
# 钉钉 webhook (加签)
SEC69162axxxf59sdss23|https://oapi.dingtalk.com/robot/send?access_token=09bsdfa66xxxa608bsds
```

### 3.1 本地调试

```bash
npm run start:local
```

### 3.2 单元测试

```bash
npm run test
```

## 四、参与贡献

请参阅：[CONTRIBUTING.md](https://github.com/vv314/actions-mtz-coupons/blob/main/CONTRIBUTING.md)

## 五、📜 声明

本项目仅供学习与研究之用，请勿用于商业或非法用途。原作者不能完全保证项目的合法性，准确性和安全性，因使用不当造成的任何损失与损害，与原作者无关。请仔细阅读此声明，一旦您使用并复制了本项目，则视为已接受此声明。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=vv314/actions-mtz-coupons&type=Date)](https://star-history.com/#vv314/actions-mtz-coupons&Date)
