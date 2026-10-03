const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.olmemtechnicalservices.com';

// Public pages only. /admin is intentionally absent and is disallowed in robots.
const PATHS = ['', '/services', '/service-area', '/about', '/contact', '/privacy'];

export default function sitemap() {
  const lastModified = new Date();
  return PATHS.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: path === '' ? 1 : 0.8,
  }));
}
