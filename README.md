![外卖神券天天领](https://p0.meituan.net/dptakeaway/11b0b51183806e09f55a530fc0dd0409328863.jpg)

# 外卖神券天天领

> 超值红包享不停

外卖神券天天领，以自动化的方式定时领取美团外卖优惠券。

## 使用教程

### 获取活动 TOKEN

打开[红包活动页](https://activityunion-marketing.meituan.com/mtzcoupon/index.html)，登录后使用 Chrome DevTools 或任意抓包工具获取 cookie 信息，提取 `token` 字段值。

示例：

```
token=Js3xxxxFyy_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx;
```

### 部署

使用 [GitHub Actions](https://docs.github.com/cn/actions) 部署：

1. Fork 源项目
   1. 访问 [actions-mtwm-coupons](https://github.com/vv314/actions-mtwm-coupons) 源仓库
   2. 点击右上角 `Star` 按钮 ;)
   3. 点击右上角 `Fork` 按钮
2. 添加 Actions secrets
   1. 导航到你的仓库的主页面
   2. 在仓库名称下，点击 `⚙️Settings`（设置）
   3. 在左侧边栏中，点击 `Secrets`（密码）
   4. 点击 `New repository secret` 创建仓库密码
      1. 在 `Name` 输入框中填入 `TOKEN`
      2. 在 `Value` 输入框中填入对应值
   5. 点击 `Add secret` 保存配置

#### 工作流触发时机

- git push (main 分支)
- 每日 `11:05` 定时执行

注意：每日 `11:00~12:30` 之间可领取 `满30-6`, `满15-2` 红包，推荐在此期间执行。

### 推送设置

在任务执行后推送通知。

#### Bark (仅 iOS 支持)

手机 App Store 下载 [Bark App](https://apps.apple.com/cn/app/id1403753865)
Bark 将为每个设备将被分配一个唯一的推送 URL

```
URL 组成：host/:key/:body
示例: https://api.day.app/kkWwxxxq5NpWx/推送内容...

key: 推送 key，设备唯一标识
body: 推送内容
```

##### 配置 Bark key

1. 提取推送 `key`（本例为 `kkWwxxxq5NpWx`）
2. 进入项目 `Settings - Secrets` 配置页，点击 `New repository secret`，添加 `BARK_KEY` 项

### 调试

项目根目录下创建 `.env` 文件，填入 `Secrets` 信息。

示例:

```bash
# cookie token
TOKEN=token=Js3xxxxFyy_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xxxg9xx;
# bark 推送 key
BARK_KEY=kkWwxxxq5NpWx
```

运行调试命令：

```bash
yarn test
```
