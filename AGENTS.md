# XFBrowser 项目 AGENTS 配置

## 项目概述
XFBrowser 是基于 **Firefox (mozilla-central)** 的 Windows 隐私增强浏览器。

## 构建命令
- 同步源码: `.\sync.bat`（Firefox mozilla-central git 镜像，浅克隆）
- 编译构建: `.\build.bat`（x64 Release，通过 mach）

## 源码结构
- `src/fluent-ui/` - Fluent UI v2 前端（纯 CSS + ES Module）
- `src/pages/` - 内置页面（新标签页、设置页）
- `src/privacy/` - 隐私引擎（广告拦截、指纹伪装、Cookie隔离、DoH）
- `patches/` - Firefox 补丁集（保留目录结构，内容待添加）
- `.github/workflows/build.yml` - CI 构建定义

## 代码规范
- 前端：纯 CSS + ES Module，禁止 Webpack/Vite/Rollup
- 补丁：git format-patch 格式或 mozilla 的 mercurial 补丁格式
- Windows 平台，仅 x64 Release 目标

## CI 状态
- 已完成从 Chromium 到 Firefox 的迁移
- CI 使用 `windows-2022` runner，`mach build` 构建
- `actions/cache@v4` 缓存 mozilla-central 源码避免重复克隆
- Firefox git mirror: https://github.com/mozilla/gecko-dev.git

## 历史
- 原项目基于 ungoogled-chromium（128.0.6613.84），有 104 个官方补丁 + 12 个 XFBrowser 定制补丁
- 切换到 Firefox 因为：源码更小、内建隐私保护（ETP/Total Cookie Protection/DoH）、patch 更少
- 隐私引擎（`src/privacy/`）保留 C++ 结构但迁移到 Firefox XPCOM API
