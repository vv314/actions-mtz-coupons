![外卖神券天天领](https://p0.meituan.net/dptakeaway/11b0b51183806e09f55a530fc0dd0409328863.jpg)

# 🧧【美团】外卖神券天天领

![workflow](https://img.shields.io/github/workflow/status/vv314/actions-mtz-coupons/%E9%A2%86%E7%BA%A2%E5%8C%85?label=%E9%A2%86%E7%BA%A2%E5%8C%85&logo=github%20actions&style=flat) ![release](https://img.shields.io/github/v/release/vv314/actions-mtz-coupons) ![update](https://img.shields.io/github/last-commit/vv314/actions-mtz-coupons/main?label=update) ![fork](https://img.shields.io/github/forks/vv314/actions-mtz-coupons)

外卖神券天天领，超值红包享不停；以自动化的方式领取美团红包。

> ★ 多帐号支持，全村都能配上<br/>★ 并行化任务，数管齐下更有效率<br/>★ 异常重试，一次不行再来一次<br/>★ 多路消息通知，总有一个到达你<br/>★ Github Actions 部署，从未如此简单

## 📕 使用教程

#### 获取账号 TOKEN

打开[美团主页](http://i.meituan.com/)，登录后使用 Chrome DevTools 或任意抓包工具获取 cookie 信息，提取 `token` 字段值。

示例：

```
token=Js3xxxxFyy_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx;
```

### 🚀 部署

使用 [GitHub Actions](https://docs.github.com/cn/actions) 部署：

1. Fork 源项目
   1. 访问 [actions-mtz-coupons](https://github.com/vv314/actions-mtz-coupons) 源仓库
   2. 点击右上角 `Star` 按钮 ;)
   3. 点击右上角 `Fork` 按钮
2. 添加 Actions secrets
   1. 导航到 Fork 后的仓库主页面
   2. 在仓库菜单栏中，点击 `⚙️Settings`（设置）
   3. 点击侧边栏 `Secrets`（密码）条目
   4. 点击 `New repository secret` 创建仓库密码
      1. 在 `Name` 输入框中填入 `TOKEN`
      2. 在 `Value` 输入框中填入从 cookie 中提取的 token 值
   5. 点击 `Add secret` 保存配置

_Fork 后的项目可执行 `npm run sync` 同步上游更新，详细参考【脚本更新】章节_

### TOKEN 格式

`TOKEN` Secret 支持 `String` 或 `JSON` 对象两种数据格式。
当配置 `String` 类型时，值为 cookie 中提取的 token 信息；
当配置 `JSON` 对象类型时，应包含以下属性：

| 属性名  | 类型   | 默认值    | 必填 | 说明                     |
| ------- | ------ | --------- | ---- | ------------------------ |
| token   | string |           | 是   | 账号 token               |
| alias   | string | token\<i> | 否   | 账号别名，便于区分多账户 |
| qywxUid | string |           | 否   | 企业微信通知，用户 id    |
| tgUid   | string |           | 否   | Telegram 通知，用户 id   |
| barkKey | string |           | 否   | Bark 通知，推送 Key      |

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

`TOKEN` Secret 配置为数组时，可传入多个账户配置。

混合配置示例:

```json
[
  "Js3xxxxFyy_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx",
  {
    "token": "3R2xxxxxUqS_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx",
    "alias": "鱼言",
    "barkKey": "kkWwxxxq5NpWx",
    "qywxUid": "Vincent"
  }
]
```

#### 脚本触发方式

Github Actions 工作流支持**手动**与**自动**两种触发方式

- 自动触发，每日 `11:05` 定时执行（已开启）
- 手动触发
  - [在项目主页上调用](https://docs.github.com/cn/actions/managing-workflow-runs/manually-running-a-workflow#)
  - [使用 REST API 调用](https://docs.github.com/cn/rest/reference/actions#create-a-workflow-dispatch-event)

### 🔔 消息通知

通知运行结果。按照粒度分为**用户通知**和**全局通知**：

- 用户通知：每个账户执行时推送（TOKEN 中配置）
- 全局通知：所有任务执行完毕后推送

通知支持下列推送平台：

- Bark
- Telegram
- 企业微信
- Server 酱

#### Bark（仅 iOS 支持）

[Bark](https://apps.apple.com/cn/app/id1403753865) 是一款可以接收自定义通知的 iOS 应用。

打开 Bark App 获取推送 key：

```
URL 组成：host/:key/:body
示例: https://api.day.app/kkWwxxxq5NpWx/推送内容...

key: 推送 key，设备唯一标识
body: 推送内容
```

##### 用户通知配置

`TOKEN` Secret 配置为 JSON 格式，添加 `barkKey` 属性

##### 全局通知配置

1. 提取推送 `key`（本例为 `kkWwxxxq5NpWx`）
2. 进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`
   - 新建 `BARK_KEY` 项，填入推送 key

#### Telegram

[Telegram](https://telegram.org) 是一款跨平台的专注于安全和速度的聊天软件。通过创建 Telegram Bot，可发送自定义通知。

##### 创建 Telegram Bot\*

_已拥有 Telegram Bot？直接参考下节 **【配置 Bot Token】**_

1. Telegram 搜索 [@BotFather](https://t.me/botfather)，点击 `/start` 启用 bot
2. 点击 `/newbot` 创建自定义 bot
   1. 输入 bot 昵称
   2. 输入 bot id（需全局唯一），以 `_bot` 结尾，例：`test233_bot`
3. 创建成功后，将会返回你的 bot token（例：`1689581149:AAGYVVjEHsaNxxxT8eQxxxshwr2o4Pxxxu86`）
4. Telegram 搜索刚刚创建的 bot id（本例: `test_bot`），点击 `/start` 启用 bot

##### 配置 Bot Token

1. Telegram 搜索 [@BotFather](https://t.me/botfather)，点击 `/mybots`，获取 bot token
2. 进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`
   - 新建 `TG_BOT_TOKEN` 项，填入 bot token

##### 用户通知配置

`TOKEN` Secret 配置为 JSON 格式，添加 `tgUid` 属性

##### 全局通知配置

1. Telegram 搜索 [@userinfobot](https://t.me/useridinfobot)，点击 `/start`，获取用户 ID
2. 进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`
   - 新建 `TG_USER_ID` 项，填入用户 ID

#### 企业微信

[企业微信](https://work.weixin.qq.com) 是微信团队出品的企业通讯与办公应用，具有与微信互联的能力。

##### 创建企业微信应用\*

_已拥有企业微信应用？直接参考下节 **【配置企业应用】**_

1. PC 端打开[企业微信官网](https://work.weixin.qq.com/)，注册一个企业
2. 注册完成后，进入“[应用管理](https://work.weixin.qq.com/wework_admin/frame#apps)” → “应用” → “自建”，点击 `➕创建应用`
3. 完善应用名称与 logo 信息，可见范围选择公司名

##### 配置企业应用

1. 在管理后台 “[我的企业](https://work.weixin.qq.com/wework_admin/frame#profile)” → “企业信息” 下获取 “企业 ID”
2. 在管理后台 “[应用管理](https://work.weixin.qq.com/wework_admin/frame#apps)” → “应用” → “自建”，点进目标应用，获取 `AgentId`（应用 ID）
3. 在管理后台 “[应用管理](https://work.weixin.qq.com/wework_admin/frame#apps)” → “应用” → “自建”，点进目标应用，获取 `Secret`（应用钥匙）
4. 进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`
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

#### Server 酱（仅支持全局通知）

[Server 酱](https://sct.ftqq.com) 是一款从服务器、路由器等设备上推消息到手机的工具。

1. 打开 Server 酱 [SendKey](https://sct.ftqq.com/sendkey) 页面，获取 `SendKey`
2. 进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`
   - 新建 `SC_SEND_KEY` 项，填入 `SendKey`

## 🔄 脚本更新

此项目将长期维护，为了确保副本能够及时享受到上游更新，请定期执行同步操作。

### 使用命令同步（推荐）

执行 npm script：

```bash
npm run sync
```

脚本执行后会拉取上游仓库的最新主分支代码，与本地主分支进行合并，最后合并结果同步到远程仓库。

### 手动同步

参考 Github 官方文档 [同步复刻](https://docs.github.com/cn/github/collaborating-with-issues-and-pull-requests/syncing-a-fork)

## 🛠 开发 & 测试

项目根目录下创建 `.env` 文件，填入 `Secrets` 信息。

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
```

运行调试命令：

```bash
yarn dev
```

## 📜 声明

本项目仅供学习与研究之用，请勿用于商业或非法用途。原作者不能完全保证项目的合法性，准确性和安全性，因使用不当造成的任何损失与损害，与原作者无关。请仔细阅读此声明，一旦您使用并复制了本项目，则视为已接受此声明。
