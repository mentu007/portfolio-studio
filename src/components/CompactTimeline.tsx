import { useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useSiteLocale } from './use-site-locale';

export type CompactTimelineItem = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  cover: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
  liveUrl?: string;
};

type Props = {
  items: CompactTimelineItem[];
  basePath: string;
};

const copy = {
  zh: {
    open: '\u67e5\u770b\u8be6\u60c5',
    timelineLabel: '\u9879\u76ee\u65f6\u95f4\u7ebf'
  },
  en: {
    open: 'View details',
    timelineLabel: 'Project timeline'
  }
} as const;

function withBase(basePath: string, path: string) {
  const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!base || base === '/') {
    return normalizedPath;
  }

  return `${base}${normalizedPath}`.replace(/\/{2,}/g, '/');
}

export default function CompactTimeline({ items, basePath }: Props) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const locale = useSiteLocale();
  const baseId = useId();
  const labels = copy[locale];

  return (
    <div
      className="relative ml-2 border-l border-slate-200 pl-5 dark:border-slate-800"
      aria-label={labels.timelineLabel}
    >
      {items.map((item) => {
        const isOpen = openSlug === item.slug;
        const panelId = `${baseId}-${item.slug}-panel`;
        const triggerId = `${baseId}-${item.slug}-trigger`;

        return (
          <article key={item.slug} className="relative mb-4 last:mb-0 md:mb-6">
            <span
              aria-hidden="true"
              className="absolute -left-[1.688rem] top-3 block h-2.5 w-2.5 rounded-full bg-slate-300 ring-4 ring-white dark:bg-slate-700 dark:ring-slate-950"
            />

            <button
              id={triggerId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenSlug((current) => (current === item.slug ? null : item.slug))}
              className="group flex w-full items-center gap-3 py-1.5 text-left text-fog-600 transition hover:text-fog-950 dark:text-fog-400 dark:hover:text-white"
            >
              <span className="shrink-0 text-sm text-slate-500 dark:text-slate-500">{item.date}</span>
              <span className="min-w-0 truncate font-medium">{item.title}</span>
              <span className="flex-1" />
              <motion.span
                aria-hidden="true"
                animate={prefersReducedMotion ? undefined : { rotate: isOpen ? 180 : 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="shrink-0 text-slate-400 transition group-hover:text-slate-600 dark:text-slate-600 dark:group-hover:text-slate-300"
              >
                <ChevronDown className="h-4 w-4" strokeWidth={1.8} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  initial={{ height: 0, opacity: prefersReducedMotion ? 1 : 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: prefersReducedMotion ? 1 : 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="grid gap-3 pb-1 pt-3 md:grid-cols-[minmax(0,220px),minmax(0,1fr)] md:gap-4">
                    <a
                      href={withBase(basePath, `/project/${item.slug}/`)}
                      className="group/thumb relative block overflow-hidden rounded-md border border-slate-200/80 bg-slate-950/4 dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      <img
                        src={item.cover.src}
                        alt={item.cover.alt}
                        width={item.cover.width}
                        height={item.cover.height}
                        loading="lazy"
                        className="h-24 w-full object-cover transition duration-500 group-hover/thumb:scale-[1.03] md:h-28"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/8 via-transparent to-slate-950/36 dark:from-slate-950/18 dark:to-slate-950/50" />
                    </a>

                    <div className="flex min-w-0 flex-col gap-3 md:gap-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-slate-200/80 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <p className="line-clamp-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {item.summary}
                      </p>

                      <div>
                        <a
                          href={withBase(basePath, `/project/${item.slug}/`)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                        >
                          <span>{labels.open}</span>
                          <span aria-hidden="true">-&gt;</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
  );
}
