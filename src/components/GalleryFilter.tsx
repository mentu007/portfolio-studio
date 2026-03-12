import { startTransition, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useSiteLocale } from './use-site-locale';

type GalleryProject = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  date: string;
  cover: {
    src: string;
    width: number;
    height: number;
    alt: string;
  };
};

type Labels = {
  zh: {
    all: string;
    results: string;
    open: string;
  };
  en: {
    all: string;
    results: string;
    open: string;
  };
};

type Props = {
  projects: GalleryProject[];
  tags: string[];
  basePath: string;
  labels: Labels;
};

const ALL_TAG = '__all__';

function withBase(basePath: string, path: string) {
  const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!base || base === '/') {
    return normalizedPath;
  }

  return `${base}${normalizedPath}`.replace(/\/{2,}/g, '/');
}

export default function GalleryFilter({ projects, tags, basePath, labels }: Props) {
  const [activeTag, setActiveTag] = useState(ALL_TAG);
  const locale = useSiteLocale();
  const prefersReducedMotion = useReducedMotion();
  const copy = labels[locale];

  const filteredProjects =
    activeTag === ALL_TAG ? projects : projects.filter((project) => project.tags.includes(activeTag));

  return (
    <div className="section-shell overflow-hidden">
      <div className="flex flex-wrap gap-3">
        {[ALL_TAG, ...tags].map((tag) => {
          const active = tag === activeTag;
          const label = tag === ALL_TAG ? copy.all : tag;

          return (
            <button
              key={tag}
              type="button"
              onClick={() => startTransition(() => setActiveTag(tag))}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                active
                  ? 'border-fog-900 bg-fog-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950'
                  : 'border-fog-200 bg-white/85 text-fog-700 hover:border-fog-400 hover:text-fog-900 dark:border-slate-700 dark:bg-slate-900/72 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-fog-200 pt-4 text-xs font-mono uppercase tracking-[0.26em] text-fog-500 dark:border-slate-700 dark:text-slate-400">
        <span>{copy.results.replace('{count}', String(filteredProjects.length))}</span>
        <span>{activeTag === ALL_TAG ? copy.all : activeTag}</span>
      </div>

      <LayoutGroup>
        <motion.div
          layout
          className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 28 }}
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.a
                layout
                key={project.slug}
                href={withBase(basePath, `/project/${project.slug}/`)}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
                animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.985 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-[1.7rem] border border-fog-200 bg-white/85 dark:border-slate-700 dark:bg-slate-900/72"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={project.cover.src}
                    alt={project.cover.alt}
                    width={project.cover.width}
                    height={project.cover.height}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-fog-900/78 dark:to-slate-950/88" />
                  <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
                    <div className="absolute inset-[1.1rem] rounded-[1.15rem] border border-white/30 dark:border-slate-200/16" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.26em] text-white/70">{project.date}</p>
                    <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">{project.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/78">{project.summary}</p>
                    <p className="mt-3 text-xs font-medium uppercase tracking-[0.22em] text-white/74">{copy.open}</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
