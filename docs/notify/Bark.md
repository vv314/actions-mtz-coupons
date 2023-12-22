# Bark

[Bark](https://apps.apple.com/cn/app/id1403753865) 是一款可以接收自定义通知的 iOS 应用

## 获取推送 key

打开 Bark App 查看推送 url：

```
URL 组成：host/:key/:body
示例: https://api.day.app/kkWwxxxq5NpWx/推送内容...

host: 服务域名
key: 推送 key，设备唯一标识
body: 自定义推送内容
```

提取推送 `key`，本例为 `kkWwxxxq5NpWx`

## 用户通知配置

> [!NOTE]
> 需使用 [JSON Token 配置格式](./token配置.md)。

`TOKEN` Secret 配置为 JSON 格式，添加 `barkKey` 属性，填入推送 key。

## 全局通知配置

进入项目 "Settings" → "Secrets" 配置页，点击 `New repository secret`

- 新建 `BARK_KEY` 项，填入推送 key
