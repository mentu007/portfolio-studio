import { useEffect, useEffectEvent, useState } from 'react';
import type { LocalizedText } from '../data/site';
import type { TocItem } from '../utils/headings';
import { useSiteLocale } from './use-site-locale';

type Props = {
  items: TocItem[];
  title: LocalizedText;
  openLabel: LocalizedText;
  closeLabel: LocalizedText;
};

function flatten(items: TocItem[]): TocItem[] {
  return items.flatMap((item) => [item, ...flatten(item.children)]);
}

function TocBranch({
  items,
  activeId,
  onNavigate
}: {
  items: TocItem[];
  activeId: string;
  onNavigate: () => void;
}) {
  return (
    <ol className="space-y-1.5">
      {items.map((item) => (
        <li key={item.slug}>
          <a
            href={`#${item.slug}`}
            onClick={onNavigate}
            className={`block rounded-xl px-3 py-2 text-sm leading-6 transition ${
              activeId === item.slug
                ? 'bg-fog-900 text-white'
                : 'text-fog-600 hover:bg-white hover:text-fog-900'
            } ${item.depth === 3 ? 'ml-4' : item.depth === 2 ? 'ml-2' : ''}`}
          >
            {item.text}
          </a>
          {item.children.length > 0 && (
            <div className="mt-1">
              <TocBranch items={item.children} activeId={activeId} onNavigate={onNavigate} />
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

export default function TocNav({ items, title, openLabel, closeLabel }: Props) {
  const locale = useSiteLocale();
  const flatItems = flatten(items);
  const [activeId, setActiveId] = useState(flatItems[0]?.slug ?? '');
  const [open, setOpen] = useState(false);

  const syncActiveHeading = useEffectEvent((entries: IntersectionObserverEntry[]) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

    if (visible[0]) {
      setActiveId(visible[0].target.id);
      return;
    }

    const crossed = entries
      .filter((entry) => entry.boundingClientRect.top < 140)
      .sort((left, right) => right.boundingClientRect.top - left.boundingClientRect.top);

    if (crossed[0]) {
      setActiveId(crossed[0].target.id);
    }
  });

  useEffect(() => {
    if (flatItems.length === 0) {
      return;
    }

    setActiveId(flatItems[0].slug);

    const elements = flatItems
      .map((item) => document.getElementById(item.slug))
      .filter((item): item is HTMLElement => Boolean(item));

    const observer = new IntersectionObserver((entries) => syncActiveHeading(entries), {
      rootMargin: '-14% 0px -68% 0px',
      threshold: [0, 0.2, 0.4, 1]
    });

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [flatItems, syncActiveHeading]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="sticky top-4 overflow-hidden py-3 md:py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="section-eyebrow">{title[locale]}</p>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="px-3 py-1.5 text-xs font-medium text-fog-700 transition hover:text-fog-950 md:hidden dark:text-fog-300 dark:hover:text-white"
        >
          {open ? closeLabel[locale] : openLabel[locale]}
        </button>
      </div>

      <div className={`${open ? 'mt-4 block' : 'hidden'} md:mt-4 md:block`}>
        <TocBranch items={items} activeId={activeId} onNavigate={() => setOpen(false)} />
      </div>
    </div>
  );
}
