import { useEffect, useEffectEvent, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowDown,
  ChevronLeft,
  Clock3,
  Languages,
  LayoutGrid,
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
    <p className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-fog-500 dark:text-fog-400">
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
      className="relative flex h-10 w-10 items-center justify-center text-fog-700 transition hover:text-fog-950 dark:text-fog-300 dark:hover:text-white"
    >
      <Icon className="h-5 w-5" strokeWidth={1.6} />
      {badge && (
        <span className="absolute -right-0.5 -top-0.5 rounded-full bg-fog-900 px-1.5 py-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.12em] text-white dark:bg-white dark:text-fog-950">
          {badge}
        </span>
      )}
    </button>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-1 py-2">
      <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-fog-500 dark:text-fog-400">
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl text-fog-950 dark:text-fog-50">{value}</p>
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
      className="group flex w-full items-center justify-between gap-3 py-2.5 text-left text-sm font-medium text-fog-700 transition hover:text-fog-950 dark:text-fog-300 dark:hover:text-white"
    >
      <span className="flex items-center gap-3">
        <Icon className="h-4 w-4" strokeWidth={1.6} />
        <span>{label}</span>
      </span>
      <ArrowDown className="h-4 w-4 text-fog-400 transition group-hover:text-fog-600 dark:text-fog-600 dark:group-hover:text-fog-300" strokeWidth={1.6} />
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
    <ol className="space-y-0.5">
      {items.map((item) => (
        <li key={item.slug}>
          <a
            href={`#${item.slug}`}
            onClick={(event) => onNavigate(item.slug, event)}
            className={`block px-2 py-1.5 text-sm leading-6 transition ${
              activeId === item.slug
                ? 'text-fog-950 dark:text-white'
                : 'text-fog-600 hover:text-fog-950 dark:text-fog-400 dark:hover:text-white'
            } ${item.depth === 3 ? 'ml-4' : item.depth === 2 ? 'ml-2' : ''}`}
          >
            {getTocLabel(item, locale)}
          </a>
          {item.children.length > 0 && (
            <div className="mt-0.5">
              <TocBranch items={item.children} activeId={activeId} onNavigate={onNavigate} locale={locale} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

function MenuIcon() {
  return (
    <div className="flex h-5 w-5 flex-col items-center justify-center gap-[5px]">
      <span className="block h-[1.5px] w-full bg-current transition-transform duration-200" />
      <span className="block h-[1.5px] w-full bg-current transition-transform duration-200" />
    </div>
  );
}

export default function DynamicSidebar(props: Props) {
  const locale = useSiteLocale();
  const theme = useSiteTheme();
  const prefersReducedMotion = useReducedMotion();
  const [collapsed, setCollapsed] = useState(true);
  const [activeId, setActiveId] = useState('');
  const [hiddenOffset, setHiddenOffset] = useState(380);
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

    setHiddenOffset(width);

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
    <>
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        aria-label={copy.toggleDock[locale]}
        aria-expanded={!collapsed}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center text-fog-800 opacity-60 transition hover:opacity-100 dark:text-fog-100"
      >
        <MenuIcon />
      </button>

      <div className="pointer-events-none fixed inset-y-0 left-0 z-40 flex items-start justify-start">
        <motion.div
          ref={dockRef}
          initial={{ x: -hiddenOffset }}
          animate={{ x: collapsed ? -hiddenOffset : 0 }}
          transition={motionTransition}
          className="pointer-events-auto relative h-dvh w-[min(19rem,calc(100vw-0.75rem))] max-w-[19rem] border-r border-fog-200 bg-[#fafafa] pt-16 dark:border-fog-800 dark:bg-[#0a0a0a] sm:w-[19rem]"
        >
          <div className="flex h-full flex-col gap-6 overflow-y-auto px-5 pb-6">
            <div className="flex items-center justify-between">
              <DockSectionTitle label={copy.dock[locale]} />
              <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-fog-400 dark:text-fog-500">
                {props.mode === 'home' ? copy.home[locale] : copy.detail[locale]}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
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

                <div className="flex flex-col gap-1">
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
                <div className="flex flex-col gap-1">
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
        </motion.div>
      </div>
    </>
  );
}
