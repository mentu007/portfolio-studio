---
type: Fix
description: Astro + Vite 大规模代码变更后 HMR 崩溃，需重启 dev server
scope: Frontend
tech: Astro@6.x + Vite@6.x
status: Active
---

## ❌ 反模式 (Anti-Pattern)
*描述：导致报错或性能问题的写法*

在 Astro 项目中一次性修改多个组件文件（如重构 `DynamicSidebar.tsx`、调整 `astro.config.mjs`、修改 `global.css`）后，依赖 Vite HMR 自动刷新，结果终端出现：

```
[ERROR] Cannot read properties of undefined (reading 'call')
Stack trace:
    at EnvironmentPluginContainer.transform
    at async loadAndTransform
```

浏览器白屏或显示 TypeError，且 HMR 完全失效，后续任何文件保存都无法恢复。

## ✅ 正模式 (Best Practice)
*描述：符合当前架构的正确写法*

1. **大规模重构后主动重启 dev server**：
   ```bash
   # 停止当前服务
   Ctrl + C
   # 重新启动
   npm run dev
   ```

2. **分批次修改 + 验证**：每修改 1-2 个文件后检查页面是否正常，避免一次性改动过多文件触发 HMR 边界情况。

3. **遇到 `EnvironmentPluginContainer.transform` 错误时**：不要尝试刷新浏览器或继续修改代码，直接重启服务是最快的恢复方式。

> 这是 Vite 的已知问题（[vitejs/vite#21162](https://github.com/vitejs/vite/issues/21162)），在 Astro + Tailwind CSS v4 环境下尤其容易出现，与业务代码本身无关。
