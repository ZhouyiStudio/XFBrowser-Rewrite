# XFBrowser 项目 AGENTS 配置

## 项目概述
XFBrowser 是基于 ungoogled-chromium 的 Windows 隐私增强浏览器。

## 构建命令
- 同步源码: `.\sync.bat`（TUNA 镜像，浅克隆，稀疏检出）
- 编译构建: `.\build.bat`（x64 Release，跳过测试/其他平台）
- CI 构建: GitHub Actions Windows 2022  runner

## 源码结构
- `patches/` - Chromium 补丁集
  - `patches/ungoogled-chromium-official/` - 104 个官方补丁（tag 128.0.6613.84-1）+ `series` 文件
  - `patches/ungoogled-chromium/` - XFBrowser ungoogled-chromium 覆盖补丁（6 个）
  - `patches/fluent-ui/` - Fluent UI 覆盖补丁（3 个）
  - `patches/privacy/` - 隐私引擎覆盖补丁（3 个）
- `.github/workflows/build.yml` - CI 构建定义
- `.gitattributes` - `*.patch text eol=lf`
- `src/fluent-ui/` - Fluent UI v2 前端（纯 CSS + ES Module）
- `src/pages/` - 内置页面（新标签页、设置页）
- `src/privacy/` - 隐私引擎（广告拦截、指纹伪装、Cookie隔离、DoH）
- `docs/` - 架构/补丁/构建文档

## 代码规范
- 前端：纯 CSS + ES Module，禁止 Webpack/Vite/Rollup
- 补丁：标准 git diff 格式，`// XFBrowser:` 前缀注释
- Windows 平台，仅 x64 Release 目标

## CI 状态
### 已完成
- CI 拆分为 2 job（`setup` → `build`），通过 `actions/cache@v4` 共享 source
- Branch trigger 修复：`branches: [master, main]`
- 使用完整浅克隆（`--depth 1`），去掉稀疏检出
- 104 个官方 ungoogled-chromium 补丁通过 `series` 文件按序应用
- 所有 115 个 patch 文件（104 官方 + 11 XFBrowser）：blank context 行修复（leading space），hunk separator 保留，行尾统一 LF
- `.gitattributes` 强制 patch 文件使用 LF
- `$LASTEXITCODE` 检查 + `--whitespace=fix` 确保补丁应用失败时及时报错
- XFBrowser 覆盖补丁（11 个）的 hunk header range count（`+N,M` 和 `-N,M`）已修正——original 工具生成的 patch 尾部 context 行未被计入 range

### 已完成（修复 XFBrowser overlay patch 格式）
- hunk header range count（`+N,M` 和 `-N,M`）已修正——original 工具生成的 patch 尾部 context 行未被计入 range
- 同文件多 hunk 间的空白分隔行已移除（`git apply` 会丢失文件关联导致 "patch fragment without header"）
- 尾部多余的 trailing context 行已移除（会被当作 hunk body 的最后一个 context 行）
- CI 的 `git apply` 添加 `--recount` 标志，忽略 header 行数直接根据 hunk body 推算（仅限 XFBrowser overlay，官方 patch 不用）
- 等待 CI pipeline 验证

## 重要决策
- 放弃稀疏检出（排除太激进导致补丁丢失文件）
- 用本地 commit 的 patch 目录替代远程 ungoogled-chromium 仓库克隆（可靠，避免 500+ MB 克隆）
- 通过 `.gitattributes` 强制所有 patch 文件使用 LF，防止 Windows CI 上的 CRLF 损坏
- 使用 `series` 文件保证官方补丁顺序
- 11 个 XFBrowser 覆盖补丁是原项目作者工具生成，有 hunk range count 不匹配问题，已通过 `--recount` + 格式修复处理

## 重要决策
- 放弃稀疏检出（排除太激进导致补丁丢失文件）
- 用本地 commit 的 patch 目录替代远程 ungoogled-chromium 仓库克隆（可靠，避免 500+ MB 克隆）
- 通过 `.gitattributes` 强制所有 patch 文件使用 LF，防止 Windows CI 上的 CRLF 损坏
- 使用 `series` 文件保证官方补丁顺序
- 11 个 XFBrowser 覆盖补丁是原项目作者工具生成，有 hunk range count 不匹配问题，已修复
