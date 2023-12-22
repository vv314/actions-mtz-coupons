# Qmsg 酱

[Qmsg 酱](https://qmsg.zendee.cn/) 是一个 QQ 消息推送平台。

## 获取 qmsg key

进入 Qmsg 酱[管理台](https://qmsg.zendee.cn/me.html)。登录后获取推送 `key`

</details>

## 添加 qmsg key

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `QMSG_KEY` 项，填入 `key`

## 用户通知配置

> [!NOTE]
> 需使用 [JSON Token 配置格式](./token配置.md)。

`TOKEN` 中添加 `qq` 属性，填入用户 QQ 号。

## 全局通知配置

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `QMSG_ADMIN` 项，填入 qq 号
