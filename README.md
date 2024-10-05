<p align="center">
  <a href="https://github.com/vv314/actions-mtz-coupons" rel="noopener noreferrer">
    <img width="240" src="https://github-production-user-asset-6210df.s3.amazonaws.com/7637375/291613192-73636f3d-7271-4802-b0fe-328c479c1e35.png">
  </a>
</p>
<br/>
<p align="center">
  <a href="https://github.com/vv314/actions-mtz-coupons"><img src="https://img.shields.io/github/actions/workflow/status/vv314/actions-mtz-coupons/grab-coupon.yml?branch=main&label=%E9%A2%86%E7%BA%A2%E5%8C%85&logo=github%20actions&style=flat" alt="workflow"></a>
  <a href="https://github.com/vv314/actions-mtz-coupons/releases"><img src="https://img.shields.io/github/v/release/vv314/actions-mtz-coupons" alt="release"></a>
  <a href="https://github.com/vv314/actions-mtz-coupons"><img src="https://img.shields.io/github/last-commit/vv314/actions-mtz-coupons/main?label=update" alt="update"></a>
  <a href="https://github.com/vv314/actions-mtz-coupons/fork"><img src="https://img.shields.io/github/forks/vv314/actions-mtz-coupons?style=flat" alt="forks"></a>
  <a href="https://github.com/vv314/actions-mtz-coupons"><img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fvv314%2Factions-mtz-coupons&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com" alt="forks"></a>
</p>
<br/>

# 🧧 外卖神券天天领 Ver.2

<p>外卖神券天天领，超值红包享不停；以自动化的方式领取外卖红包。</p><br/>

> [!TIP]
> ★ 专注领劵，不搞杂七杂八<br/>★ 多帐号支持，全村都能配上<br/>★ 并行化任务，数管齐下更有效率<br/>★ 异常重试，一次不行再来一次<br/>★ 多路消息通知，总有一个到达你<br/>★ Github Actions 部署，操作如此简单
> <br/>

## 📕 使用

### 环境要求

- [Node.js](https://nodejs.org/) v20.0 及以上
- [pnpm](https://pnpm.io/) v8.0 及以上

### 获取账号 Token

- [使用 Chrome DevTools 获取账号 Token](./docs/获取token.md)

**示例：**

```
Js3xxxxFyy_Aq-rOnxMte6vKPV4AAAAA6QwAADgqRBSfcmNqyuG8CQ7JDL7xxxxNGbfF7tPNV5347_ANLcydua_JHCSRj0_xx
```

### [GitHub Actions](https://docs.github.com/cn/actions) 部署

#### 1. Fork 源项目

1.  访问 [actions-mtz-coupons](https://github.com/vv314/actions-mtz-coupons) 源仓库
2.  点击右上角 `Star` 按钮 ;)
3.  点击右上角 `Fork` 按钮

> [!TIP]
> Fork 后的项目可执行 `npm run sync` 同步上游更新，详情参考 [一键同步](./docs/更新.md)。

#### 2. 配置 Actions secrets

1. 导航到你的仓库主页面，点击 ⚙️**Settings**
2. 在边栏的 "Security" 部分中选择 <svg version="1.1" width="16" height="16" viewBox="0 0 16 16" class="octicon octicon-key-asterisk" aria-hidden="true"><path d="M0 2.75A2.75 2.75 0 0 1 2.75 0h10.5A2.75 2.75 0 0 1 16 2.75v10.5A2.75 2.75 0 0 1 13.25 16H2.75A2.75 2.75 0 0 1 0 13.25ZM2.75 1.5c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V2.75c0-.69-.56-1.25-1.25-1.25Z"></path><path d="M8 4a.75.75 0 0 1 .75.75V6.7l1.69-.975a.75.75 0 0 1 .75 1.3L9.5 8l1.69.976a.75.75 0 0 1-.75 1.298L8.75 9.3v1.951a.75.75 0 0 1-1.5 0V9.299l-1.69.976a.75.75 0 0 1-.75-1.3L6.5 8l-1.69-.975a.75.75 0 0 1 .75-1.3l1.69.976V4.75A.75.75 0 0 1 8 4Z"></path></svg> **Secrets and variables**、然后单击 **Actions**
3. 选中 **Secrets** tab，点击 **New repository secret** 创建仓库密码
   1. 在 `Name` 表单项填入 "TOKEN"
   2. 在 `Secret` 表单项填入 Token 值（参考 [获取 Token](./docs/获取token.md)）
4. 点击 **Add secret** 保存配置

#### 3. 启用 Actions

1. 导航到你的仓库主页面，点击 <svg version="1.1" width="16" height="16" viewBox="0 0 16 16" class="octicon octicon-play" aria-hidden="true"><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm4.879-2.773 4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215Z"></path></svg> **Actions**
2. 在左侧边栏中，点击 **领红包**
   ![启用](https://github.com/vv314/actions-mtz-coupons/assets/7637375/7a1fb38d-8489-4d1a-9318-f1f2e5fab878)
3. 点击 **Enable workflow** 启用 Actions

### 脚本触发方式

Github Actions 工作流支持**手动**与**自动**两种触发方式。

#### 定时触发（默认开启）

每日 `11:00` 前定时执行。

#### 手动触发

- [在项目主页上调用](https://docs.github.com/cn/actions/managing-workflow-runs/manually-running-a-workflow#)
- [使用 REST API 调用](https://docs.github.com/cn/rest/reference/actions#create-a-workflow-dispatch-event)

## 🤹‍♂️ 进阶用法

- [使用 JSON Token](./docs/token配置.md)
- [添加消息通知](./docs/通知.md)
- [使用多账户配置](./docs/token配置.md)
- [脚本更新](./docs/更新.md)
- [本地运行](./docs/本地运行.md)

## 🏗 参与贡献

请参阅：[CONTRIBUTING.md](https://github.com/vv314/actions-mtz-coupons/blob/main/CONTRIBUTING.md)

## 📜 声明

本项目仅供学习与研究之用，请勿用于商业或非法用途。原作者不能完全保证项目的合法性，准确性和安全性，因使用不当造成的任何损失与损害，与原作者无关。请仔细阅读此声明，一旦您使用并复制了本项目，则视为已接受此声明。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=vv314/actions-mtz-coupons&type=Date)](https://star-history.com/#vv314/actions-mtz-coupons&Date)
