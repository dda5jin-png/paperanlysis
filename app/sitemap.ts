import type { MetadataRoute } from "next";
import { GUIDE_ARTICLES } from "@/lib/guide-data";
import { classifyArchiveContent, getPublishedArchiveContents } from "@/lib/content-sections";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://paperanalysis.cloud";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const publishedContents = await getPublishedArchiveContents();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/analyzer`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guide`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/resources`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/library`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/ideas`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/refund`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/editorial-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/source-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const guideRoutes: MetadataRoute.Sitemap = GUIDE_ARTICLES.map((article) => ({
    url: `${SITE_URL}/guide/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const publicContentRoutes: MetadataRoute.Sitemap = publishedContents.map((content) => {
    const section = classifyArchiveContent(content);
    return {
      url: `${SITE_URL}/${section}/${content.slug}`,
      lastModified: new Date(content.published_at ?? content.updated_at),
      changeFrequency: "monthly",
      priority: section === "blog" ? 0.8 : 0.7,
    };
  });

  return [...staticRoutes, ...guideRoutes, ...publicContentRoutes];
}
