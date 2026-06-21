# XFBrowser 补丁开发指南

## 补丁结构

所有补丁位于 `patches/` 目录，按模块分类：

```
patches/
├── ungoogled-chromium/     # （已弃用）Chromium 时代的补丁
├── fluent-ui/              # Fluent UI 界面补丁
│   ├── 0001-window-mica.patch
│   ├── 0002-acrylic-windows10.patch
│   └── 0003-fluent-ui-controls.patch
└── privacy/                # 隐私增强补丁
    ├── 0001-ad-block.patch
    ├── 0002-fingerprint.patch
    └── 0003-doh-dns.patch
```

## 补丁格式

使用标准 Git 补丁格式（`git format-patch` 输出）：

```diff
diff --git a/path/to/file.cc b/path/to/file.cc
--- a/path/to/file.cc
+++ b/path/to/file.cc
@@ -1,10 +1,4 @@
-// 移除的代码
+// 新增的代码
```

注意事项：
- 使用 `git format-patch` 或 `git diff` 生成补丁
- 避免在补丁中包含绝对路径
- 在补丁头部添加 XFBrowser 修改说明注释

## 创建新补丁

```bash
# 1. 在 firefox-src 中修改文件
cd firefox-src

# 2. 生成补丁
git diff > ../patches/XXXX-description.patch

# 3. 测试补丁应用
git checkout .
git apply ../patches/XXXX-description.patch
```

## 补丁更新流程

当 Firefox 版本升级时：

1. 运行 sync.bat 获取新版 mozilla-central
2. 尝试应用所有补丁，记录失败项
3. 逐一修复冲突补丁
4. 验证所有功能正常

## 补丁编写规范

- **最小化修改**：只修改必要的代码行
- **保留原注释**：用 `// XFBrowser:` 前缀添加注释说明
- **兼容性**：确保补丁对 Win10/Win11 均适用
- **可追溯**：每个补丁文件头部注明修改目的和影响范围
