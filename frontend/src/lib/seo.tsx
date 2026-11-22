import type { Metadata } from 'next';

export const SITE_URL = 'https://www.shreedurgatiles.site';
export const SITE_NAME = 'Shree Durga Tiles';
export const SOCIAL_IMAGE = '/og-image.jpg';

export interface PageSeo {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}

export function createPageMetadata({ title, description, path, noIndex }: PageSeo): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: 'Shree Durga Tiles showroom in Naugaon, Alwar' }],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}

export function getLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: SITE_NAME,
    alternateName: 'श्री दुर्गा टाइल्स',
    url: SITE_URL,
    telephone: ['+91 85293 88726', '+91 80582 85886'],
    email: 'dileepsaini8726@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Delhi–Alwar Road, Near Kapoor Dharamshala',
      addressLocality: 'Naugaon',
      addressRegion: 'Rajasthan',
      addressCountry: 'IN',
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      opens: '00:00',
      closes: '23:59',
    },
    areaServed: ['Alwar', 'Naugaon', 'Rajgarh', 'Thanagazi', 'Tijara', 'Bhiwadi', 'Behror'],
    image: `${SITE_URL}${SOCIAL_IMAGE}`,
    logo: `${SITE_URL}/favicon.ico`,
    sameAs: [
      '{{TODO: Google Business Profile URL}}',
      '{{TODO: Facebook URL}}',
      '{{TODO: Instagram URL}}',
      '{{TODO: YouTube URL}}',
      '{{TODO: JustDial URL}}',
      '{{TODO: IndiaMART URL}}',
    ],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '{{TODO: latitude}}',
      longitude: '{{TODO: longitude}}',
    },
  };
}

export function getBreadcrumbSchema(path: string, label: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: label, item: `${SITE_URL}${path}` },
    ],
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const serializedData = JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializedData }}
    />
  );
}
