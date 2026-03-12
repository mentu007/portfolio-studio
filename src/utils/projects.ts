import { getCollection, type CollectionEntry } from 'astro:content';

export type ProjectEntry = CollectionEntry<'projects'>;

const projectVideos = import.meta.glob('../content/projects/**/*.{mp4,webm}', {
  eager: true,
  import: 'default'
}) as Record<string, string>;

export async function getProjects() {
  const projects = await getCollection('projects', ({ data }) => import.meta.env.DEV || !data.draft);
  return projects.sort((left, right) => right.data.date.getTime() - left.data.date.getTime());
}

export function getTagIndex(projects: ProjectEntry[]) {
  return [...new Set(projects.flatMap((project) => project.data.tags))]
    .sort((left, right) => left.localeCompare(right, 'en'));
}

export function formatProjectDate(date: Date, format: 'short' | 'full' = 'short') {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  const day = `${date.getUTCDate()}`.padStart(2, '0');

  return format === 'full' ? `${year}-${month}-${day}` : `${year}.${month}.${day}`;
}

export function resolveProjectVideo(project: ProjectEntry) {
  if (!project.data.video) {
    return null;
  }

  const relativePath = project.data.video.replace(/^\.\//u, '');
  return projectVideos[`../content/projects/${project.id}/${relativePath}`] ?? null;
}
