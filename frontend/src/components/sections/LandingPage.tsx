import Link from 'next/link';
import { Phone, MessageCircle, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { JsonLd, SITE_URL } from '@/lib/seo';
import type { LandingPageContent } from '@/data/landingPages';

const primaryPhone = '+918529388726';
const whatsappUrl = 'https://wa.me/918529388726?text=Hello%20Shree%20Durga%20Tiles%2C%20I%20want%20a%20quote%20for%20marble%2Ftiles.';

export function LandingPage({ page }: { page: LandingPageContent }) {
  const path = `/${page.slug}`;
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: page.h1, item: `${SITE_URL}${path}` },
    ],
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={faqSchema} />
      <div className="bg-ivory">
        <section className="bg-brown-dark py-16 text-white md:py-24">
          <Container>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-gold-light">Shree Durga Tiles · Naugaon, Alwar</p>
            <h1 className="max-w-4xl font-cinzel text-4xl font-medium leading-tight text-white sm:text-5xl">{page.h1}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/75">{page.intro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={`tel:${primaryPhone}`} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/40 px-6 font-semibold text-white hover:bg-white/10">
                <Phone className="h-4 w-4" /> Call +91 85293 88726
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#E2BE86] px-6 font-semibold text-[#241110]">
                <MessageCircle className="h-4 w-4" /> WhatsApp us
              </a>
              <Link href="/contact" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 font-semibold text-brown">
                Request a quote <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Container>
        </section>

        <Container className="py-12 md:py-16">
          <div className="mx-auto max-w-4xl space-y-10">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-cinzel text-2xl font-semibold text-brown md:text-3xl">{section.heading}</h2>
                <div className="mt-4 space-y-4 leading-relaxed text-brown-light">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </section>
            ))}

            <section aria-labelledby="landing-faq-heading">
              <h2 id="landing-faq-heading" className="font-cinzel text-2xl font-semibold text-brown md:text-3xl">Frequently asked questions</h2>
              <div className="mt-5 space-y-4">
                {page.faqs.map((faq) => (
                  <article key={faq.question} className="rounded-2xl border border-stone-line bg-white p-5">
                    <h3 className="font-semibold text-brown">{faq.question}</h3>
                    <p className="mt-2 leading-relaxed text-brown-light">{faq.answer}</p>
                  </article>
                ))}
              </div>
            </section>

            <nav aria-label="Related material pages" className="border-t border-stone-line pt-7">
              <h2 className="font-cinzel text-xl font-semibold text-brown">Explore more at Shree Durga Tiles</h2>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
                {[
                  ['Marble tiles in Alwar', '/marble-tiles-alwar'],
                  ['Italian marble', '/italian-marble-alwar'],
                  ['Granite', '/granite-alwar'],
                  ['Designer tiles', '/designer-tiles-alwar'],
                  ['Bathroom tiles', '/bathroom-tiles-alwar'],
                  ['Kitchen tops', '/kitchen-tops-alwar'],
                  ['Mandir marble', '/mandir-marble-alwar'],
                  ['Outdoor stone', '/outdoor-stone-alwar'],
                  ['Tiles shop in Naugaon', '/tiles-shop-naugaon'],
                  ['Products', '/products'],
                  ['Contact', '/contact'],
                ].filter(([, href]) => href !== path).map(([label, href]) => (
                  <Link key={href} href={href} className="font-semibold text-gold-dark underline decoration-gold/50 underline-offset-4 hover:text-maroon">{label}</Link>
                ))}
              </div>
            </nav>
          </div>
        </Container>
      </div>
    </>
  );
}
