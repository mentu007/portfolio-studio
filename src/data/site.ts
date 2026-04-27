export type Locale = 'zh' | 'en';

export type LocalizedText = {
  zh: string;
  en: string;
};

export const siteProfile = {
  name: '刘良君 / Jesse',
  location: 'Guangzhou, Guangdong',
  tagline: {
    zh: '能够独立完成架构设计与技术选型，具备产品思维与 UI 设计审美，能够从用户体验角度优化产品交互。',
    en: 'Able to independently handle architecture design and technical selection, with product thinking and UI design sensibility to improve interaction from the user experience perspective.'
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
