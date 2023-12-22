# Telegram

[Telegram](https://telegram.org) 是一款跨平台的专注于安全和速度的聊天软件。通过创建 Telegram Bot，可发送自定义通知。

## 创建 Telegram Bot

1. Telegram 搜索 [@BotFather](https://t.me/botfather)，点击 `/start` 启用 bot
2. 点击 `/newbot` 创建自定义 bot
   1. 输入 bot 昵称
   2. 输入 bot id（需全局唯一），以 `_bot` 结尾，例：`test233_bot`
3. 创建成功后，将会返回你的 bot token（例：`1689581149:AAGYVVjEHsaNxxxT8eQxxxshwr2o4Pxxxu86`）
4. Telegram 搜索刚刚创建的 bot id（本例: `test_bot`），点击 `/start` 启用 bot

### 获取 Bot Token

Telegram 搜索 [@BotFather](https://t.me/botfather)，点击 `/mybots`，获取 bot token

### 获取用户 ID

Telegram 搜索 [@userinfobot](https://t.me/useridinfobot)，点击 `/start`，获取用户 ID。

## 添加 Bot Token

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `TG_BOT_TOKEN` 项，填入 bot token

## 用户通知配置

> [!NOTE]
> 需使用 [JSON Token 配置格式](./token配置.md)。

`TOKEN` 中添加 `tgUid` 属性，填入用户 ID。

## 全局通知配置

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `TG_USER_ID` 项，填入用户 ID
