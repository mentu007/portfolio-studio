export type Locale = 'zh' | 'en';

export type LocalizedText = {
  zh: string;
  en: string;
};

export const siteProfile = {
  name: '刘良君',
  location: 'Guangzhou, Guangdong',
  tagline: {
    zh: '聚焦前端体验、产品表达与可落地实现，把想法打磨成清晰、稳定、可分享的数字作品。',
    en: 'Focused on frontend experience, product storytelling, and practical implementation that turns ideas into clear, stable, shareable digital work.'
  },
  intro: {
    zh: '这里会逐步整理我在前端开发、界面实现与产品原型上的实践记录。当前站点已完成基础发布，后续会持续补充真实项目、实现思路与复盘内容。',
    en: 'This site will gradually collect my work across frontend development, interface implementation, and product prototyping. The foundation is live now, with real projects, implementation notes, and retrospectives to be added over time.'
  },
  email: '2621082160@qq.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/mentu007' },
    { label: 'Email', href: 'mailto:2621082160@qq.com' }
  ],
  seo: {
    title: '刘良君 | Frontend Portfolio',
    description: '刘良君的个人作品集网站，聚焦前端开发、界面实现、产品原型与持续迭代中的真实实践。'
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
