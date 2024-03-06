# wxpusher 通知

[wxpusher](https://wxpusher.zjiecode.com/docs/#/) 是一个微信的消息推送平台。

## 后台微信登录后创建应用

进入 [wxpusher 官网](https://wxpusher.zjiecode.com/admin/login)，扫码登录后创建一个应用

## 获取 wxpusher token

在你创建应用的过程中，你应该已经看到appToken，如果没有保存，可以通过侧边栏的菜单编辑应用重制它。

## 获取 topicId

创建完应用后，为你的应用创建一个主题（topic），然后就可以获取到 topicId。

</details>

## 全局通知配置

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `WXPUSHER_TOKEN` 项，填入 `token`
- 新建 `WXPUSHER_TOPICID` 项，填入 `topicId`
