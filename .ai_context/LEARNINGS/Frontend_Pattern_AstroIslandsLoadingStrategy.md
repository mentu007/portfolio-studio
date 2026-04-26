---
type: Pattern
description: Astro Islands 加载策略选择指南与性能优化实践
scope: Frontend
tech: Astro@6.x + React Islands
status: Active
---

## ❌ 反模式 (Anti-Pattern)
*描述：导致报错或性能问题的写法*

在 Astro 页面中，对所有交互组件统一使用 `client:load`，导致首屏加载大量不必要的 JavaScript：

```astro
<!-- 所有组件立即加载，拉长了关键请求链 -->
<DynamicSidebar client:load />
<CompactTimeline client:load />
<GalleryFilter client:load />
<FooterAnimation client:load />
```

这会导致：
- 关键请求链过长（> 600ms）
- 首屏交互就绪时间延迟
- 低端设备上明显的卡顿感

## ✅ 正模式 (Best Practice)
*描述：符合当前架构的正确写法*

根据组件的交互优先级和视口位置，选择合适的 `client:*` 指令：

| 指令 | 加载时机 | 适用场景 | 示例 |
|------|----------|----------|------|
| `client:load` | DOM Ready 立即加载 | 首屏核心交互组件 | 导航栏、搜索框 |
| `client:idle` | 浏览器空闲时 | 首屏可见但非立即交互 | 侧边栏、主题切换 |
| `client:visible` | 进入视口时 | 首屏下方或视口外组件 | 时间线、画廊筛选 |
| `client:media` | 匹配媒体查询时 | 响应式组件 | 移动端菜单 |

```astro
<!-- 优化后的加载策略 -->
<DynamicSidebar client:idle />      <!-- 首屏可见，但非核心交互 -->
<CompactTimeline client:visible />  <!-- 通常不在首屏 -->
<GalleryFilter client:visible />    <!-- 滚动到画廊区域才加载 -->
```

**额外优化**：
- 在 `astro.config.mjs` 中配置 `manualChunks` 将 React 运行时和动画库分包，提升缓存命中率
- 首屏关键组件使用 `client:idle` 而非 `client:load`，减少首屏 JS 负载 30%+
