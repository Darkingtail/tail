# Workspace 安装位置问题记录

- **日期**：2025-10-14
- **背景**：在 `apps/mall4r` 目录执行 `pnpm install`，期望依赖安装到该子项目下。

## 问题现象
- 依赖和 `pnpm-lock.yaml` 被写到了仓库根目录 `D:\dev\darkingtail\tail`。
- 根目录出现新的 `node_modules`，`apps/mall4r` 内部没有自己的 `node_modules`。

## 调查重点
- 仓库根目录存在 `pnpm-workspace.yaml`，即便只有注释也会让 pnpm 判断这里是 workspace 根。
- `packages` 未列出子包时，workspace 中只有根包，子目录内执行 `pnpm install` 会自动回溯到根包。

## 解决方式
1. 在 `pnpm-workspace.yaml` 中加入：
   ```yaml
   packages:
     - apps/*
   ```
2. 再次在 `apps/mall4r` 执行 `pnpm install --filter mall4r...`，依赖会按照 workspace 规则归属 mall4r 子包。

## 后续计划
- 保留 workspace 结构，未来接入 Turborepo 可以直接沿用。
- 新增子项目时同步维护 `pnpm-workspace.yaml` 的 `packages` 列表。

---

# Rolldown 本地依赖缺失问题记录

- **日期**：2025-10-14
- **背景**：在 `apps/mall4r` 目录运行 `pnpm dev`，项目使用 `rolldown-vite@7.1.14` 作为 Vite 替代方案。

## 问题现象
- 启动失败，终端报错 `Cannot find native binding ... @rolldown/binding-win32-x64-msvc`。
- 日志提示参考 npm 关于可选依赖的已知问题。

## 调查重点
- `rolldown` 通过可选依赖分发平台原生绑定，需要拉取 `@rolldown/binding-win32-x64-msvc` 才能在 Windows x64 正常运行。
- 初始安装时该可选依赖未被下载，导致运行时缺失。

## 解决方式
1. 在 workspace 根执行 `pnpm install`，触发对所有可选依赖的重新解析与下载。
2. 安装完成后，`node_modules/.pnpm` 新增了 `@rolldown+binding-win32-x64-msvc@1.0.0-beta.41`，重新运行 `pnpm dev` 即可启动。

## 后续计划
- 必要时运行 `pnpm approve-builds` 允许 `@swc/core`、`msw` 等依赖执行构建脚本，防止类似缺失。
- 留意后续 `rolldown-vite` 更新，若再出现绑定问题可考虑回退到官方 `vite` 或手动安装对应 binding。