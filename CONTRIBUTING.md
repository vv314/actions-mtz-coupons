# 参与贡献

1. [Fork 项目](https://help.github.com/articles/fork-a-repo/)
2. 安装依赖 (`yarn install`)
3. 创建你的特性分支 (`git checkout -b my-new-feature`)
4. 提交你的修改 (`git commit -am 'Added some feature'`)
5. 测试你的修改 (`yarn test`)
6. 推送分支 (`git push origin my-new-feature`)
7. [创建 Pull Request](https://help.github.com/articles/creating-a-pull-request/)

## 开发

- 使用 Node 16+ 运行环境
- 使用 [Yarn](https://yarnpkg.com/) 作为包管理工具
- 使用 [ECMAScript](https://nodejs.org/api/esm.html#modules-ecmascript-modules) 模块规范

## 测试

使用 [Jest](https://github.com/facebook/jest) 作为测试套件。测试命令：

```sh
yarn test
```

## 编码规范

使用 [ESLint](https://eslint.org/) 和 [editorconfig](http://editorconfig.org) 保持代码风格和最佳实践。请确保你的 PR 符合指南的要求，检测命令:

```sh
yarn lint
```
