# XFBrowser 构建指南

## 环境要求

### 硬件
- CPU: 8 核以上推荐
- 内存: 16GB+（32GB 推荐）
- 磁盘: SSD 256GB+ 剩余空间（源码 ~20GB + 构建产物 ~40GB）
- 系统: Windows 10/11 x64

### 软件
- Windows 10/11 x64
- Visual Studio 2022（含 C++ 桌面开发工作负载）
- Windows 10/11 SDK（10.0.20348.0+）
- Git for Windows
- Python 3.8+
- 7-Zip（用于解压工具链）

## 构建步骤

### 第一步: 同步源码

```bash
# 运行一键同步脚本（使用 TUNA 镜像，无需代理）
sync.bat
```

该脚本将：
1. 从清华 TUNA 镜像浅克隆 Chromium 128
2. 配置稀疏检出，过滤 Android/Linux/macOS 无关平台
3. 下载 ungoogled-chromium 补丁并应用
4. 同步 Windows 编译依赖
5. 最终源码占用约 20GB

### 第二步: 配置编译环境

#### 安装 Visual Studio 2022

包含以下组件：
- MSVC v143 - VS 2022 C++ x64/x86 build tools
- Windows 10/11 SDK (10.0.20348.0)
- C++ ATL for v143 build tools

设置环境变量：
```bash
set DEPOT_TOOLS_WIN_TOOLCHAIN=0
set GYP_MSVS_OVERRIDE_PATH=C:\Program Files\Microsoft Visual Studio\2022\Community
```

### 第三步: 编译

```bash
# 运行构建脚本（自动配置 GN + Ninja）
build.bat
```

### 第四步: 运行

编译完成后，可执行文件位于：
```
chromium-src/out/x64_Release_XFBrowser/chrome.exe
```

首次运行建议添加以下参数：
```bash
chrome.exe --disable-features=TranslateUI --disable-sync
```

## 编译优化

### SSD 优化
- 确保 Chromium 源码位于 SSD 上
- 关闭 Windows Defender 实时扫描（添加排除目录）
- 增加 `NINJA_JOBS` 环境变量以使用全部 CPU 核心

### 增量编译
```bash
# 只编译修改过的文件
ninja -C out/x64_Release_XFBrowser chrome
```

### 清理编译产物
```bash
# 清理后需要重新全量编译
rm -rf out/x64_Release_XFBrowser
gn gen out/x64_Release_XFBrowser
ninja -C out/x64_Release_XFBrowser chrome
```

## 常见问题

### Q: 编译失败提示缺少 SDK
A: 确认已安装 Windows 10/11 SDK，并设置正确的 Visual Studio 路径。

### Q: 同步时网络中断
A: sync.bat 内置断点续传机制，重新运行将从断点继续。

### Q: 编译速度太慢
A: 确保使用 SSD，增加 `NINJA_JOBS` 数量，关闭杀毒软件实时扫描。

### Q: 需要调试构建
A: 修改 `config/gn-args.txt` 中 `is_debug = true`，然后重新生成 GN。
