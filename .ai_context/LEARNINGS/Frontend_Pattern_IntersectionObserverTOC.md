---
type: Pattern
description: 使用 IntersectionObserver 替代 scroll + getBoundingClientRect 实现 TOC 高亮追踪
scope: Frontend
tech: React@19 + TypeScript
status: Active
---

## ❌ 反模式 (Anti-Pattern)
*描述：导致报错或性能问题的写法*

在滚动事件中直接使用 `getBoundingClientRect()` 计算当前可见的 heading，触发强制同步布局：

```typescript
// 每次滚动都强制浏览器同步计算布局
const handleScroll = () => {
  const positions = headings.map((heading) => ({
    id: heading.id,
    top: heading.element.getBoundingClientRect().top  // 强制同步布局
  }));
  // ... 计算 active heading
};

window.addEventListener('scroll', handleScroll);
```

问题：
- 滚动期间每帧都触发强制同步布局，阻塞主线程
- 滚动帧率下降，低端设备上明显卡顿
- 虽然使用了 `requestAnimationFrame` 和 `{ passive: true }`，但无法避免强制同步布局本身

## ✅ 正模式 (Best Practice)
*描述：符合当前架构的正确写法*

使用 `IntersectionObserver` 替代滚动监听，由浏览器异步计算元素可见性：

```typescript
useEffect(() => {
  const elements = headings.map((h) => h.element);

  const observer = new IntersectionObserver(
    (entries) => {
      // 锁定期间忽略 observer 更新（点击导航后）
      if (pendingScrollTargetRef.current) return;

      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible[0]) {
        setActiveId(visible[0].target.id);
        return;
      }

      const crossed = entries
        .filter((e) => e.boundingClientRect.top < ACTIVE_LINE_PX)
        .sort((a, b) => b.boundingClientRect.top - a.boundingClientRect.top);

      if (crossed[0]) {
        setActiveId(crossed[0].target.id);
      }
    },
    {
      rootMargin: '-14% 0px -68% 0px',
      threshold: [0, 0.2, 0.4, 1],
    }
  );

  elements.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}, [headings]);
```

**关键设计点**：
1. **点击导航锁定**：用户点击 TOC 链接后，设置 `pendingScrollTargetRef` 锁定 1.6 秒，防止滚动过程中 observer 覆盖用户选择的目标
2. **多阈值观察**：`threshold: [0, 0.2, 0.4, 1]` 确保不同尺寸的 heading 都能被准确检测
3. **rootMargin 调整**：`-14% 0px -68% 0px` 将观察区域限制在视口中部，避免顶部/底部边缘的误触发

**效果**：滚动帧率稳定在 60fps，主线程无长任务。
