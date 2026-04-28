# Portfolio Studio

一个基于 `Astro + Tailwind CSS + React Islands + Content Collections` 的纯静态个人作品集模板，直接面向 GitHub Pages 部署。

## 结构

```text
src/
├── content/
│   └── projects/
│       └── <slug>/
│           ├── index.mdx
│           ├── cover.svg
│           └── 其他图片 / demo.mp4
├── components/
├── data/
│   └── site.ts
├── layouts/
├── pages/
│   ├── index.astro
│   └── project/[slug].astro
└── content.config.ts
```

## 内容工作流

1. 在 `src/content/projects/<slug>/` 下新建项目目录。
2. 编写 `index.mdx`，在 frontmatter 中填写 `title`、`date`、`summary`、`tags`、`cover`、`coverAlt`。
3. 将封面、正文图片、可选 `demo.mp4` 直接放在同目录。
4. 运行 `npm run check` 和 `npm run build` 验证内容与页面。

## 常用命令

- `npm run dev`：本地开发
- `npm run check`：Astro 类型与内容校验
- `npm run build`：生产构建
- `npm run preview`：本地预览构建产物

## GitHub Pages

- 已内置 `.github/workflows/deploy.yml`
- `astro.config.mjs` 会优先读取 GitHub Actions 注入的仓库信息自动推导 `site` 和 `base`
- 本地生产构建默认按 `/portfolio-studio/` 子路径生成资源，提前规避 GitHub Pages 的子路径 404 问题

## 部署状态

- 最近部署时间：2026-04-28
- 部署方式：GitHub Actions (`.github/workflows/deploy.yml`)

## 需要替换的个人信息

- [src/data/site.ts](./src/data/site.ts)
- `src/content/projects/` 下的示例项目内容
