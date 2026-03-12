import type { MarkdownHeading } from 'astro';

export type TocItem = MarkdownHeading & {
  kind?: 'cover';
  children: TocItem[];
};

export function buildHeadingTree(headings: MarkdownHeading[]) {
  const items: TocItem[] = [];
  const stack: TocItem[] = [];

  for (const heading of headings.filter((item) => item.depth <= 3)) {
    const node: TocItem = {
      ...heading,
      text: heading.text.replace(/\s*#$/u, '').trim(),
      children: []
    };

    while (stack.length > 0 && stack[stack.length - 1].depth >= node.depth) {
      stack.pop();
    }

    if (stack.length === 0) {
      items.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }

    stack.push(node);
  }

  return items;
}

export function createCoverTocItem(): TocItem {
  return {
    depth: 1,
    slug: 'project-cover',
    text: 'cover',
    kind: 'cover',
    children: []
  } as TocItem;
}
