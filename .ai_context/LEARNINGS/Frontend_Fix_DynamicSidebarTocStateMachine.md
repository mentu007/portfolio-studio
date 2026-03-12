---
type: Fix
description: 修复动态大纲高亮不同步与错误回跳问题
scope: Frontend
tech: Astro@6 + React@19 + motion@12
status: Active
---

## ❌ 反模式(Anti-Pattern)
这次问题的根因，不是单纯的“动画卡顿”，而是动态大纲把高亮状态拆给了多条不一致的写入链路：点击时立即写一次，`IntersectionObserver` 回调再写一次，初始化 effect 还会把首项重新写回“封面”，程序化滚动期间又有一套 `pending` 锁定逻辑。这样会导致 `activeId` 没有单一真相源，页面滚动与高亮切换天然不同步。

更具体地说，有三个容易反复踩坑的点。第一，不能把 `IntersectionObserver` 的增量 `entries` 当成“当前所有标题的完整可见状态”，因为它只代表本次阈值变化的元素；一旦用它直接决定 active，就会出现“标题已经滚到了，选中项却还停在上一项”或者“封面突然抢回高亮”的现象。第二，不能直接使用“最后一个越过激活线的标题”来处理包含 `h2` 和 `h3` 的目录结构，否则父标题刚到顶部时，距离很近的子标题会过早接管高亮，出现“关键决策”实际在视口顶部，但左侧却高亮“信息密度控制”的错位。第三，不能把程序化滚动完成条件写成“目标标题必须进入某个固定 top 阈值”，因为页面底部的标题天然可能无法被推到那个位置，结果就是“结果”这一类尾部标题永远到不了判定条件，最后只能超时回退，表现为高亮闪回“封面”。

```tsx
const syncActiveHeading = useEffectEvent((entries: IntersectionObserverEntry[]) => {
  const visible = entries.filter((entry) => entry.isIntersecting);
  const crossed = entries.filter((entry) => entry.boundingClientRect.top < 140);

  if (visible[0]) {
    setActiveId(visible[0].target.id);
    return;
  }

  if (crossed[0]) {
    setActiveId(crossed[0].target.id);
  }
});

useEffect(() => {
  setActiveId(flatItems[0].slug);
}, [tocItems]);
```

上面这种写法的问题不是某一行单独错误，而是整个高亮模型不稳定：点击、观察、初始化、滚动锁都在抢同一个状态，最终表现出来就是“卡顿”“错选”“偶发回跳”“到底部后又选回封面”。

## ✅ 正模式(Best Practice)
正确做法是把动态大纲高亮收敛成一套状态机，只保留两个核心状态：`activeId` 表示当前真实高亮项，`pendingScrollTargetId` 表示用户点击目录后、程序化滚动尚未结束时的临时锁定目标。点击目录时，先立即把目标项设为 active，让用户看到即时反馈；随后执行 `scrollIntoView` 和 hash 更新；在滚动真正空闲之前，任何基于视口位置的自动重算都不能覆盖这个点击态。等滚动停止后，再根据当前所有标题的实时位置统一计算 active。

标题计算也必须基于全量 heading 的当前位置，而不是 observer 的增量回调。实践里更稳的规则是：先按文档顺序收集所有标题元素，以一个固定激活线判断“哪个顶层标题已经接管阅读位置”；再对这个顶层标题的子标题设置更严格的接管条件，只有子标题自己真正接近顶部时才允许它替换父标题；最后对页面底部单独加一个兜底，如果滚动已经接近文档底部，就直接将最后一个标题视为 active，这样“结果”这类尾部节点不会因为视口空间不足而永远无法选中。

这次修复后的经验可以沉淀成四条操作准则。第一，`activeId` 的写入权只能属于“用户点击”与“统一的全量位置计算”两处，其他 effect 不得重置默认项。第二，程序化滚动的完成条件应采用“滚动空闲一小段时间”而不是“目标 top 到达固定数值”，这样才能兼容长页面、短页面和底部标题。第三，父子标题混排时，不能使用同一条激活线，否则层级会抢占失真；应该先判定主标题，再让子标题在更严格的阈值下接管。第四，要保留一个只在本地开发可开启的调试日志，例如通过 `localStorage.portfolioTocDebug = '1'` 打印点击目标、滚动锁开始与释放、每个标题的 `top` 值和最终 `activeId`，这样下次再遇到“看起来像卡顿，实则是状态冲突”的问题时，可以在几分钟内确认到底是哪一条链路写错了状态。

```tsx
const computeActiveHeading = useEffectEvent(() => {
  if (pendingScrollTargetRef.current) {
    return;
  }

  const positions = observedHeadingsRef.current.map((heading) => ({
    id: heading.id,
    depth: heading.depth,
    top: heading.element.getBoundingClientRect().top
  }));

  const topLevelActive = getTopLevelActive(positions, ACTIVE_LINE_PX);
  const nextActiveId = getDescendantActive(positions, topLevelActive, SUBHEADING_TAKEOVER_PX);

  setActiveId((current) => (current === nextActiveId ? current : nextActiveId));
});

function handleTocNavigation(id: string) {
  setActiveId(id);
  pendingScrollTargetRef.current = id;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  resetPendingScrollIdleTimer();
}
```

这种做法的收益很直接：点击目录时高亮能立即响应，滚动过程中不会回闪“封面”，父标题与子标题的切换时机更符合阅读直觉，页面底部标题也能稳定命中。对于任何带目录、高亮、滚动联动的阅读界面，这种“单一真相源 + 程序化滚动锁 + 全量位置计算 + 底部兜底”的结构都比混合式 observer 写法更可靠。
