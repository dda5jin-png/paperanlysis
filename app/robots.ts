import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://paperanalysis.cloud';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'], // 관리자 및 API 경로는 크롤링 제외
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
