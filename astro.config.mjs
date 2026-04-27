// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const isUserSite = Boolean(repository && owner && repository === `${owner}.github.io`);
const defaultBase =
  process.env.NODE_ENV === 'production' && !isUserSite
    ? `/${repository ?? 'portfolio-studio'}`
    : '/';

export default defineConfig({
  site: process.env.SITE_URL ?? (owner ? `https://${owner}.github.io` : 'https://example.github.io'),
  base: process.env.PUBLIC_BASE_PATH ?? (isUserSite ? '/' : defaultBase),
  trailingSlash: 'always',
  integrations: [react(), mdx()],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: {
            className: ['heading-anchor'],
            ariaLabel: 'Direct link to section'
          },
          content: {
            type: 'text',
            value: '#'
          }
        }
      ],
      [
        rehypePrettyCode,
        {
          keepBackground: false,
          theme: 'github-light-default'
        }
      ]
    ]
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssMinify: true
    }
  }
});
