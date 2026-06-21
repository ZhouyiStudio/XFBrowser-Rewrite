# XFBrowser 构建指南

## 环境要求

### 硬件
- CPU: 8 核以上推荐
- 内存: 16GB+（32GB 推荐）
- 磁盘: SSD 256GB+ 剩余空间（源码 ~5GB + 构建产物 ~20GB）
- 系统: Windows 10/11 x64

### 软件
- Windows 10/11 x64
- Visual Studio 2022（含 C++ 桌面开发工作负载）
- Git for Windows
- Python 3.11+
- Rust（由 sync.bat 自动安装）
- MozillaBuild（由 CI 或手动安装）

## 构建步骤

### 第一步：同步源码

```bash
# 运行一键同步脚本
sync.bat
```

该脚本将：
1. 从 GitHub gecko-dev 镜像浅克隆 Firefox mozilla-central
2. 运行 mach bootstrap 配置构建环境
3. 安装 Rust 工具链
4. 最终源码占用约 5GB

### 第二步：编译

```bash
# 运行构建脚本（自动配置 mozconfig + mach build）
build.bat
```

### 第三步：运行

编译完成后，可执行文件位于：

```
firefox-src/obj-x64-release/dist/firefox/firefox.exe
```

## 编译优化

### 增量编译
```bash
cd firefox-src
python mach build
```

### 清理编译产物
```bash
cd firefox-src
python mach clobber
```

## 常见问题

### Q：编译失败提示缺少 SDK
A：确认已安装 Visual Studio 2022 和 Windows 10/11 SDK。

### Q：同步时网络中断
A：重新运行 sync.bat，git 浅克隆支持断点续传。

### Q：编译速度太慢
A：确保使用 SSD，mach build 会自动检测 CPU 核心数并行编译。

### Q：需要调试构建
A：在 mozconfig 中添加 `ac_add_options --enable-debug`。
