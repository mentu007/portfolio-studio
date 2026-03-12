import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({
    pattern: ['**/index.md', '**/index.mdx'],
    base: './src/content/projects',
    generateId: ({ entry }) => entry.replace(/\/index\.(md|mdx)$/u, '')
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      date: z.date(),
      summary: z.string().trim().min(8).max(100),
      tags: z.array(z.string().trim().min(1)).min(1).transform((tags) => [...new Set(tags)]),
      cover: image(),
      coverAlt: z.string().min(1),
      video: z.string().regex(/^\.\//u, 'video path must be relative to the project folder').optional(),
      repoUrl: z.url().optional(),
      liveUrl: z.url().optional(),
      featured: z.boolean().default(false),
      draft: z.boolean().default(false)
    })
});

export const collections = { projects };
