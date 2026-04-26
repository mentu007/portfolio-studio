import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDown,
  ChevronLeft,
  Clock3,
  Code2,
  Languages,
  LayoutGrid,
  ListTree,
  MoonStar,
  SunMedium,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { LocalizedText } from '../data/site';
import type { TocItem } from '../utils/headings';
import { applyLocale, applyTheme } from '../utils/site-preferences';
import { useSiteLocale } from './use-site-locale';
import { useSiteTheme } from './use-site-theme';

type HomeProps = {
  mode: 'home';
  projectCount: number;
  tagCount: number;
};

type DetailProps = {
  mode: 'detail';
  homeHref: string;
  tocItems: TocItem[];
};

type Props = HomeProps | DetailProps;

type ObservedHeading = {
  id: string;
  depth: number;
  element: HTMLElement;
};

const TOC_DEBUG_STORAGE_KEY = 'portfolioTocDebug';
const ACTIVE_LINE_PX = 96;
const MAX_PENDING_MS = 1600;
const BOTTOM_THRESHOLD_PX = 4;
const SUBHEADING_TAKEOVER_PX = ACTIVE_LINE_PX / 4;

const copy = {
  dock: {
    zh: '控制坞',
    en: 'Control dock'
  },
  home: {
    zh: '主页密集控制',
    en: 'Home controls'
  },
  detail: {
    zh: '阅读控制',
    en: 'Reading controls'
  },
  toggleDock: {
    zh: '切换侧边栏',
    en: 'Toggle sidebar'
  },
  system: {
    zh: '系统控制',
    en: 'System'
  },
  navigation: {
    zh: '快速跳转',
    en: 'Quick jumps'
  },
  stats: {
    zh: '微型统计盘',
    en: 'Mini metrics'
  },
  projects: {
    zh: '项目总数',
    en: 'Projects'
  },
  tags: {
    zh: '技术标签',
    en: 'Tags'
  },
  timeline: {
    zh: '浏览时间线',
    en: 'Timeline'
  },
  gallery: {
    zh: '筛选画廊',
    en: 'Gallery'
  },
  backHome: {
    zh: '返回主页',
    en: 'Back home'
  },
  outline: {
    zh: '动态大纲',
    en: 'Reading map'
  },
  cover: {
    zh: '\u5c01\u9762',
    en: 'Cover'
  },
  emptyOutline: {
    zh: '当前项目没有可生成的目录。',
    en: 'No headings were generated for this project.'
  },
  themeDark: {
    zh: '切换到深色',
    en: 'Switch to dark'
  },
  themeLight: {
    zh: '切换到浅色',
    en: 'Switch to light'
  },
  language: {
    zh: '切换语言',
    en: 'Switch language'
  }
} satisfies Record<string, LocalizedText>;

function readHashId(hash: string) {
  const value = hash.replace(/^#/u, '');

  if (!value) {
    return '';
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isTocDebugEnabled() {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(TOC_DEBUG_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function debugToc(message: string, payload?: unknown) {
  if (!isTocDebugEnabled()) {
    return;
  }

  if (payload === undefined) {
    console.info(`[toc] ${message}`);
    return;
  }

  console.info(`[toc] ${message}`, payload);
}

function flatten(items: TocItem[]): TocItem[] {
  return items.flatMap((item) => [item, ...flatten(item.children)]);
}

function getTocLabel(item: TocItem, locale: 'zh' | 'en') {
  if (item.kind === 'cover') {
    return copy.cover[locale];
  }

  return item.text;
}

function DockSectionTitle({ label }: { label: string }) {
  return (
    <p className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
      {label}
    </p>
  );
}

function ControlButton({
  icon: Icon,
  label,
  badge,
  onClick,
  pressed
}: {
  icon: LucideIcon;
  label: string;
  badge?: string;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/65 bg-white/80 text-slate-700 shadow-[0_18px_30px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700/80 dark:bg-slate-950/72 dark:text-slate-100 dark:hover:bg-slate-950"
    >
      <Icon className="h-5 w-5" strokeWidth={1.8} />
      {badge && (
        <span className="absolute bottom-1.5 right-1.5 rounded-full bg-slate-900 px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-white dark:bg-slate-100 dark:text-slate-950">
          {badge}
        </span>
      )}
    </button>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/60 bg-white/72 px-3 py-3 dark:border-slate-700/80 dark:bg-slate-950/58">
      <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl text-slate-950 dark:text-slate-50">{value}</p>
    </div>
  );
}

function JumpButton({
  icon: Icon,
  label,
  onClick
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-[1.25rem] border border-white/60 bg-white/72 px-4 py-3 text-left text-sm font-medium text-slate-800 shadow-[0_16px_26px_rgba(15,23,42,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700/80 dark:bg-slate-950/58 dark:text-slate-100 dark:hover:bg-slate-950"
    >
      <span className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950">
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <span>{label}</span>
      </span>
      <ArrowDown className="h-4 w-4 text-slate-400 dark:text-slate-500" strokeWidth={1.8} />
    </button>
  );
}

function TocBranch({
  items,
  activeId,
  onNavigate,
  locale
}: {
  items: TocItem[];
  activeId: string;
  onNavigate: (id: string, event: ReactMouseEvent<HTMLAnchorElement>) => void;
  locale: 'zh' | 'en';
}) {
  return (
    <ol className="space-y-1.5">
      {items.map((item) => (
        <li key={item.slug}>
          <a
            href={`#${item.slug}`}
            onClick={(event) => onNavigate(item.slug, event)}
            className={`block rounded-2xl px-3 py-2.5 text-sm leading-6 transition ${
              activeId === item.slug
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950'
                : 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
            } ${item.depth === 3 ? 'ml-4' : item.depth === 2 ? 'ml-2' : ''}`}
          >
            {getTocLabel(item, locale)}
          </a>
          {item.children.length > 0 && (
            <div className="mt-1">
              <TocBranch items={item.children} activeId={activeId} onNavigate={onNavigate} locale={locale} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function DynamicSidebar(props: Props) {
  const locale = useSiteLocale();
  const theme = useSiteTheme();
  const prefersReducedMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(true);
  const [activeId, setActiveId] = useState('');
  const [hiddenOffset, setHiddenOffset] = useState(252);
  const dockRef = useRef<HTMLElement | null>(null);
  const observedHeadingsRef = useRef<ObservedHeading[]>([]);
  const pendingScrollTargetRef = useRef<string | null>(null);
  const maxPendingTimeoutRef = useRef<number | null>(null);
  const tocItems = props.mode === 'detail' ? props.tocItems : [];
  const motionTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 260, damping: 28, mass: 0.9 };

  function clearMaxPendingTimeout() {
    if (maxPendingTimeoutRef.current !== null) {
      window.clearTimeout(maxPendingTimeoutRef.current);
      maxPendingTimeoutRef.current = null;
    }
  }

  function clearPendingScrollTarget() {
    pendingScrollTargetRef.current = null;
    clearMaxPendingTimeout();
  }

  const syncDockLayout = useEffectEvent(() => {
    const root = document.documentElement;
    const width = dockRef.current?.offsetWidth ?? 308;

    setHiddenOffset(Math.max(width - 58, 220));

    if (collapsed || window.innerWidth < 1180) {
      root.style.setProperty('--sidebar-offset', '0px');
      return;
    }

    root.style.setProperty('--sidebar-offset', `${width + 28}px`);
  });

  const syncActiveHeading = useEffectEvent((entries: IntersectionObserverEntry[]) => {
    if (pendingScrollTargetRef.current) {
      return;
    }

    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

    if (visible[0]) {
      setActiveId(visible[0].target.id);
      return;
    }

    const crossed = entries
      .filter((entry) => entry.boundingClientRect.top < ACTIVE_LINE_PX)
      .sort((left, right) => right.boundingClientRect.top - left.boundingClientRect.top);

    if (crossed[0]) {
      setActiveId(crossed[0].target.id);
    }
  });

  const holdPendingScrollTarget = useEffectEvent((id: string) => {
    debugToc('pending start', {
      pendingTargetId: id,
      scrollY: Number(window.scrollY.toFixed(1))
    });

    pendingScrollTargetRef.current = id;
    clearMaxPendingTimeout();

    maxPendingTimeoutRef.current = window.setTimeout(() => {
      if (pendingScrollTargetRef.current !== id) {
        return;
      }

      debugToc('pending timeout', {
        pendingTargetId: id,
        scrollY: Number(window.scrollY.toFixed(1))
      });
      clearPendingScrollTarget();
    }, prefersReducedMotion ? 0 : MAX_PENDING_MS);
  });

  const handleWindowResize = useEffectEvent(() => {
    syncDockLayout();
  });

  const handleHashChange = useEffectEvent(() => {
    const hashId = readHashId(window.location.hash);

    if (!hashId) {
      return;
    }

    const hasTarget = observedHeadingsRef.current.some((heading) => heading.id === hashId);

    if (!hasTarget) {
      return;
    }

    debugToc('hash change', {
      hashId,
      scrollY: Number(window.scrollY.toFixed(1))
    });
    setActiveId(hashId);
  });

  useEffect(() => {
    if (window.innerWidth >= 1024) {
      setCollapsed(false);
    }
  }, []);

  useEffect(() => {
    syncDockLayout();

    window.addEventListener('resize', handleWindowResize);

    const resizeObserver =
      dockRef.current &&
      new ResizeObserver(() => {
        syncDockLayout();
      });

    if (dockRef.current && resizeObserver) {
      resizeObserver.observe(dockRef.current);
    }

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      document.documentElement.style.setProperty('--sidebar-offset', '0px');
    };
  }, [collapsed]);

  useEffect(
    () => () => {
      clearPendingScrollTarget();
    },
    []
  );

  useEffect(() => {
    if (props.mode !== 'detail' || tocItems.length === 0) {
      observedHeadingsRef.current = [];
      clearPendingScrollTarget();
      setActiveId('');
      return;
    }

    const flatItems = flatten(tocItems);
    const headings = flatItems
      .map((item) => {
        const element = document.getElementById(item.slug);

        if (!element) {
          return null;
        }

        return {
          id: item.slug,
          depth: item.depth,
          element
        } satisfies ObservedHeading;
      })
      .filter((item): item is ObservedHeading => Boolean(item));

    observedHeadingsRef.current = headings;

    const hashId = readHashId(window.location.hash);
    const initialHeading = hashId ? headings.find((heading) => heading.id === hashId) : undefined;

    debugToc('toc registered', {
      hashId,
      headings: headings.map((heading) => ({
        id: heading.id,
        depth: heading.depth
      }))
    });

    setActiveId(initialHeading?.id ?? '');

    const elements = headings.map((heading) => heading.element);

    const observer = new IntersectionObserver(
      (entries) => syncActiveHeading(entries),
      {
        rootMargin: '-14% 0px -68% 0px',
        threshold: [0, 0.2, 0.4, 1]
      }
    );

    elements.forEach((element) => observer.observe(element));

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      observedHeadingsRef.current = [];
      clearPendingScrollTarget();
      observer.disconnect();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [props.mode, tocItems]);

  function handleLocaleToggle() {
    applyLocale(locale === 'en' ? 'zh' : 'en');
  }

  function handleThemeToggle() {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  }

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });

    if (window.innerWidth < 1024) {
      setCollapsed(true);
    }
  }

  function handleTocNavigation(id: string, event: ReactMouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    debugToc('toc click', {
      id,
      scrollY: Number(window.scrollY.toFixed(1))
    });
    holdPendingScrollTarget(id);
    setActiveId(id);

    const nextHash = `#${id}`;
    if (window.location.hash === nextHash) {
      window.history.replaceState(null, '', nextHash);
    } else {
      window.history.pushState(null, '', nextHash);
    }

    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });

    if (window.innerWidth < 1024) {
      setCollapsed(true);
    }
  }

  const themeLabel = theme === 'dark' ? copy.themeLight[locale] : copy.themeDark[locale];

  return (
    <div className="pointer-events-none fixed inset-y-4 left-3 z-50 flex items-center justify-start sm:left-4">
      <motion.aside
        ref={dockRef}
        animate={{ x: collapsed ? -hiddenOffset : 0 }}
        transition={motionTransition}
        className="pointer-events-auto relative h-[calc(100dvh-2rem)] w-[min(19rem,calc(100vw-0.75rem))] max-w-[19rem] sm:w-[19rem]"
      >
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={copy.toggleDock[locale]}
          aria-expanded={!collapsed}
          className="absolute right-0 top-1/2 z-20 flex h-14 w-14 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/65 bg-white/82 text-slate-800 shadow-[0_20px_40px_rgba(15,23,42,0.14)] backdrop-blur-md transition hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/88 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          <ChevronLeft
            className="h-5 w-5 transition-transform duration-200"
            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
            strokeWidth={1.8}
          />
        </button>

        <div className="flex h-full flex-col gap-5 overflow-y-auto rounded-[1.75rem] border border-white/60 bg-white/72 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/58">
          <div className="flex items-center justify-between">
            <DockSectionTitle label={copy.dock[locale]} />
            <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              {props.mode === 'home' ? copy.home[locale] : copy.detail[locale]}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <ControlButton
              icon={theme === 'dark' ? SunMedium : MoonStar}
              label={themeLabel}
              onClick={handleThemeToggle}
            />
            <ControlButton
              icon={Languages}
              label={copy.language[locale]}
              onClick={handleLocaleToggle}
            />
          </div>

          {props.mode === 'home' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <MetricCell label={copy.projects[locale]} value={String(props.projectCount).padStart(2, '0')} />
                <MetricCell label={copy.tags[locale]} value={String(props.tagCount).padStart(2, '0')} />
              </div>

              <div className="flex flex-col gap-3">
                <DockSectionTitle label={copy.navigation[locale]} />
                <JumpButton
                  icon={Clock3}
                  label={copy.timeline[locale]}
                  onClick={() => scrollToSection('timeline')}
                />
                <JumpButton
                  icon={LayoutGrid}
                  label={copy.gallery[locale]}
                  onClick={() => scrollToSection('gallery')}
                />
              </div>
            </>
          )}

          {props.mode === 'detail' && (
            <>
              <div className="flex flex-col gap-3">
                <DockSectionTitle label={copy.navigation[locale]} />
                <JumpButton
                  icon={ChevronLeft}
                  label={copy.backHome[locale]}
                  onClick={() => {
                    window.location.href = props.homeHref;
                  }}
                />
              </div>

              {tocItems.length > 0 && (
                <div className="flex flex-col gap-3">
                  <DockSectionTitle label={copy.outline[locale]} />
                  <TocBranch
                    items={tocItems}
                    activeId={activeId}
                    onNavigate={handleTocNavigation}
                    locale={locale}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </motion.aside>
    </div>
  );
}
