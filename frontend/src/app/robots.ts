import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api',
          '/admin',
          '/admin/',
          '/cart',
          '/checkout',
          '/orders',
          '/profile',
          '/wishlist',
          '/login',
          '/register',
          '/forgot-password',
        ],
      },
    ],
    sitemap: 'https://www.shreedurgatiles.site/sitemap.xml',
  };
}