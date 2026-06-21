# XFBrowser-Rewrite

[XFBrowser-Desktop](https://github.com/ZhouyiStudio/XFBrowser-Desktop) (原 XFBrowser-Windows) 的 **Firefox 重构版**。

原项目基于 Electron 构建的跨平台桌面浏览器，此仓库将其移植到 Firefox (mozilla-central) 内核，在保留隐私增强特性的同时，利用 Firefox 原生能力获得更好的性能和隐私保护。

## 特性

- **Firefox 内核** — 基于 Mozilla Firefox (mozilla-central) 最新源码，替代 Electron
- **隐私增强** — ETP、Total Cookie Protection、DoH 开箱即用，外加自定义隐私引擎（广告拦截、指纹伪装、Cookie 隔离）
- **Fluent UI v2** — 替换原生 UI，Windows 11 Mica / Windows 10 Acrylic 窗口材质
- **纯前端** — 内置页面（新标签页、设置页）使用纯 CSS + ES Module，无构建工具

## 快速开始

```bash
# 1. 同步 Firefox 源码（浅克隆 ~5GB）
sync.bat

# 2. 编译（x64 Release）
build.bat
```

具体要求见 [构建指南](docs/build-guide.md)。

## 目录结构

```
├── sync.bat               # 源码同步
├── build.bat              # 编译构建
├── patches/               # Firefox 补丁集
├── src/
│   ├── fluent-ui/         # Fluent UI 前端
│   ├── pages/             # 内置页面（新标签页、设置）
│   ├── privacy/           # 隐私引擎
│   └── extensions/        # Firefox 扩展
├── config/                # 编译配置
└── docs/                  # 文档
```

## 版本对比

| 项目 | 平台 | 内核 | 状态 |
|------|------|------|------|
| [XFBrowser](https://github.com/xuanfeng0316/XFbrowser) | Android | WebView | 原版 |
| [XFBrowser-Desktop](https://github.com/ZhouyiStudio/XFBrowser-Desktop) | Windows/macOS/Linux | Electron | 桌面版 |
| XFBrowser-Rewrite | Windows x64 | Firefox (mozilla-central) | **重构版** |

详细架构见 [架构文档](docs/architecture.md)。
