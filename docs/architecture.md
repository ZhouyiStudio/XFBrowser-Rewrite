# XFBrowser 架构文档

## 项目概述

XFBrowser 是基于 ungoogled-chromium 补丁分支的隐私增强浏览器。从零改造 Chromium，保留完整独立浏览器形态，同时移除 Google 服务依赖，增加隐私保护功能，并使用 Fluent UI v2 重写界面。

## 目录结构

```
XFBrowser-Rewrite/
├── sync.bat                    # 一键源码同步脚本（TUNA 镜像 + 浅克隆 + 稀疏检出）
├── build.bat                   # Windows x64 Release 编译脚本
├── patches/                    # 补丁集
│   ├── ungoogled-chromium/     # 基础隐私清理补丁
│   ├── fluent-ui/              # Fluent UI 界面补丁
│   └── privacy/                # 隐私增强补丁
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

### 1. Chromium 核心层（未修改）
- Blink 渲染引擎
- V8 JavaScript 引擎
- 网络栈（HTTP/2, QUIC）
- 安全沙箱

### 2. ungoogled-chromium 补丁层
- 移除 Google 后台服务
- 移除遥测、数据上传
- 移除广告组件
- 移除 Google 登录/Sync
- 替换默认搜索引擎

### 3. XFBrowser 增强层
- **窗口材质**: Windows 11 Mica / Windows 10 Acrylic
- **Fluent UI**: 完全替换 Chromium 原生 UI
- **隐私引擎**: 内置广告拦截、指纹伪装、Cookie 隔离、DoH

### 4. 前端页面层（纯 HTML + ES Module）
- 新标签页
- 设置页面
- 无 Webpack/Vite/Rollup 等构建工具

## 关键设计决策

### 为何选择 ungoogled-chromium 而非原版？
- ungoogled-chromium 已系统性地移除所有 Google 服务依赖
- 社区维护的补丁集持续更新，减少手动工作量
- 保留 Chrome 扩展架构，100% 兼容 Chrome Web Store

### 为何前端不使用打包工具？
- 原生 ES Module 已足够满足内置页面需求
- 减少构建步骤，源码可直接在浏览器中打开调试
- 保持与 Chromium 源码风格一致

### 为何保留扩展架构？
- Chrome 扩展生态是浏览器核心价值
- ungoogled-chromium 保留了完整扩展 API
- 用户可使用 uBlock Origin、LastPass 等关键扩展
