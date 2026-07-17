import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Each markdown file in src/content/posts becomes a post at /posts/<filename>/
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,markdown}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    description: z.string().optional(),
  }),
});

export const collections = { posts };
