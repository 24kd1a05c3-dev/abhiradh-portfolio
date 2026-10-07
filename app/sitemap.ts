import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // The gallery chapters are anchors on one page, not separate URLs.
  return [{ url: 'https://abhiradh-portfolio.vercel.app/' }];
}
