import type { MetadataRoute } from 'next';
import { GUIDE_ARTICLES, GUIDE_CATEGORIES } from '@/lib/guide-data';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paperanalysis.cloud';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/analyzer`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/guides`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/latest`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/popular`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/library`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/ideas`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/refund`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/editorial-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/source-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = GUIDE_CATEGORIES.map((category) => ({
    url: `${SITE_URL}/categories/${category.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const guideRoutes: MetadataRoute.Sitemap = GUIDE_ARTICLES.map((article) => ({
    url: `${SITE_URL}/guides/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...guideRoutes];
}
