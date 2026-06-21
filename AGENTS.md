# XFBrowser 项目 AGENTS 配置

## 项目概述
XFBrowser 是基于 ungoogled-chromium 的 Windows 隐私增强浏览器。

## 构建命令
- 同步源码: `.\sync.bat`（TUNA 镜像，浅克隆，稀疏检出）
- 编译构建: `.\build.bat`（x64 Release，跳过测试/其他平台）

## 源码结构
- `patches/` - Chromium 补丁集
- `src/fluent-ui/` - Fluent UI v2 前端（纯 CSS + ES Module）
- `src/pages/` - 内置页面（新标签页、设置页）
- `src/privacy/` - 隐私引擎（广告拦截、指纹伪装、Cookie隔离、DoH）
- `docs/` - 架构/补丁/构建文档

## 代码规范
- 前端：纯 CSS + ES Module，禁止 Webpack/Vite/Rollup
- 补丁：标准 git diff 格式，`// XFBrowser:` 前缀注释
- Windows 平台，仅 x64 Release 目标
