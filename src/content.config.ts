import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/knowledge' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    type: z.string().default('concept'),
    sourcePath: z.string().optional(),
    created: z.string().optional(),
    updated: z.string().optional(),
    tags: z.array(z.string()).default([]),
    sources: z.array(z.string()).default([]),
    confidence: z.string().optional(),
    contested: z.boolean().optional(),
    summary: z.string().optional(),
  }),
});

export const collections = { knowledge };
