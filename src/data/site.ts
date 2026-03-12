export type Locale = 'zh' | 'en';

export type LocalizedText = {
  zh: string;
  en: string;
};

export const siteProfile = {
  name: 'YOUR NAME',
  location: 'Shanghai / Remote',
  tagline: {
    zh: '把复杂产品拆解成安静、清晰、可持续的体验。',
    en: 'Turning complex products into calm, legible, sustainable experiences.'
  },
  intro: {
    zh: 'Portfolio Studio 采用内容驱动的静态架构，把项目叙事、技术细节与视觉秩序压缩到一个轻量而可部署的前端系统里。',
    en: 'Portfolio Studio is a content-driven static portfolio that compresses project storytelling, technical detail, and visual order into a lightweight deployable frontend.'
  },
  email: 'hello@example.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/your-name' },
    { label: 'Email', href: 'mailto:hello@example.com' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-name/' }
  ],
  seo: {
    title: 'Portfolio Studio',
    description: 'A static portfolio built with Astro, Tailwind, and content collections for calm, high-fidelity project storytelling.'
  },
  ui: {
    homeCtas: {
      timeline: { zh: '查看时间线', en: 'Open timeline' },
      gallery: { zh: '筛选画廊', en: 'Open gallery' }
    },
    heroStats: {
      projects: { zh: '项目总数', en: 'Projects' },
      tags: { zh: '技术标签', en: 'Tags' },
      hosting: { zh: '部署模式', en: 'Hosting' }
    },
    sections: {
      contact: { zh: '保持联系', en: 'Stay in touch' },
      toc: { zh: '内容目录', en: 'On this page' },
      tocClose: { zh: '收起目录', en: 'Hide contents' },
      tocOpen: { zh: '展开目录', en: 'Show contents' },
      backHome: { zh: '返回首页', en: 'Back home' },
      liveDemo: { zh: '在线预览', en: 'Live demo' },
      repository: { zh: '代码仓库', en: 'Repository' },
      videoFallback: {
        zh: '当前示例未附带演示视频，结构已预留。',
        en: 'No sample video is attached yet. The slot is ready for one.'
      }
    },
    gallery: {
      zh: {
        all: '全部',
        results: '已显示 {count} 个项目',
        open: '查看项目'
      },
      en: {
        all: 'All',
        results: 'Showing {count} projects',
        open: 'View project'
      }
    }
  }
} as const;
