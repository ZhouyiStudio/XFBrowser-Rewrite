# XFBrowser 架构文档

## 项目概述

XFBrowser 是基于 **Firefox (mozilla-central)** 的隐私增强浏览器。使用 Firefox 内建的 ETP（增强跟踪保护）、Total Cookie Protection、DoH 等隐私保护技术，并透过 Fluent UI v2 重写界面。

## 目录结构

```
XFBrowser-Rewrite/
├── sync.bat                    # 一键源码同步脚本（GitHub gecko-dev 镜像）
├── build.bat                   # Windows x64 Release 编译脚本
├── patches/                    # Firefox 补丁集
├── src/                        # 自定义源码
│   ├── fluent-ui/              # Fluent UI v2 前端源码
│   │   ├── css/                # 样式文件（纯 CSS）
│   │   ├── js/                 # 交互模块（纯 ES Module）
│   │   └── assets/             # 图标资源
│   ├── pages/                  # 内置页面
│   │   ├── newtab/             # 新标签页
│   │   └── settings/           # 设置页
│   └── privacy/                # 隐私模块
│       ├── adblock/            # 广告拦截引擎
│       ├── fingerprint/        # 指纹随机伪装
│       ├── cookie/             # Cookie 隔离 + 反追踪
│       └── dns/                # DoH 加密 DNS 配置
├── config/                     # 编译配置
└── docs/                       # 文档
```

## 架构分层

### 1. Firefox 核心层（未修改）
- Gecko 渲染引擎
- SpiderMonkey JavaScript 引擎
- 网络栈（HTTP/3, QUIC）
- 安全沙箱

### 2. Firefox 内建隐私层
- ETP（Enhanced Tracking Protection）
- Total Cookie Protection（全站 Cookie 隔离）
- DNS over HTTPS（DoH）
- Fingerprinting Protection

### 3. XFBrowser 增强层
- **窗口材质**: Windows 11 Mica / Windows 10 Acrylic
- **Fluent UI**: 替换 Firefox 原生 UI 为 Fluent Design
- **隐私引擎**: 增强广告拦截、指纹伪装、Cookie 隔离、DoH

### 4. 前端页面层（纯 HTML + ES Module）
- 新标签页
- 设置页面
- 无 Webpack/Vite/Rollup 等构建工具

## 关键设计决策

### 为何从 Chromium 迁移到 Firefox？
- 源码更小（Firefox ~5GB vs Chromium ~20GB），构建更快
- Firefox 内建 ETP、Total Cookie Protection 等隐私功能
- 补丁更少，维护成本更低

### 为何保留 XPCOM 架构？
- Firefox XPCOM 是成熟的原生模块系统
- 隐私引擎（src/privacy/）直接对接 Firefox 原生 API

### 为何前端不使用打包工具？
- 原生 ES Module 已足够满足内置页面需求
- 减少构建步骤，源码可直接在浏览器中打开调试
- 保持与 Firefox 源码风格一致
