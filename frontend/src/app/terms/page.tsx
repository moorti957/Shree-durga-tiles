import Link from 'next/link';
import { ArrowRight, FileText, Gem, ShieldCheck } from 'lucide-react';
import Container from '@/components/ui/Container';

const termsSections = [
  {
    title: 'Using this website',
    body: 'Please use this website lawfully and provide accurate information when placing an enquiry or order. Product details and availability may change as collections are updated.',
  },
  {
    title: 'Natural materials and product imagery',
    body: 'Marble, granite and other natural materials vary in tone, veining and surface character. Product photographs are a guide; the selected stone or finished piece may have individual natural variation.',
  },
  {
    title: 'Orders and quotations',
    body: 'Review the product, quantity, delivery details and applicable charges shown during checkout or in a written quotation before confirming a purchase. Contact us if a product specification or price needs clarification.',
  },
  {
    title: 'Delivery, returns and privacy',
    body: 'Delivery and return information is described in the relevant policy pages. Personal information is handled as explained in our Privacy Policy.',
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-ivory pb-20">
      <section className="relative overflow-hidden bg-charcoal py-16 text-white md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(176,141,87,0.22),transparent_44%)]" />
        <Container className="relative">
          <div className="max-w-3xl">
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold-light">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Shree Durga Tiles
            </p>
            <h1 className="section-title text-white">Terms &amp; Conditions</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
              Please read these website terms alongside the product details and policies relevant to your order.
            </p>
          </div>
        </Container>
      </section>

      <Container className="relative -mt-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            {termsSections.map((section, index) => (
              <section key={section.title} className="rounded-2xl border border-stone-line bg-white p-6 shadow-sm md:p-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-gold-dark">
                  0{index + 1}
                </p>
                <h2 className="text-2xl font-semibold">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-brown-light md:text-base">{section.body}</p>
              </section>
            ))}
          </div>

          <aside className="h-fit rounded-2xl bg-maroon p-6 text-white shadow-lg lg:sticky lg:top-28">
            <Gem className="h-8 w-8 text-gold-light" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold text-white">Need a detail clarified?</h2>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Our team can help with product specifications, project requirements and order questions.
            </p>
            <Link href="/contact" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-gold-light px-5 py-3 text-sm font-semibold text-charcoal transition hover:bg-white">
              Contact our team <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <div className="mt-7 flex items-start gap-3 border-t border-white/15 pt-5 text-xs leading-5 text-white/70">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-light" aria-hidden="true" />
              <span>See our <Link className="text-white underline underline-offset-4" href="/shipping-policy">shipping</Link>, <Link className="text-white underline underline-offset-4" href="/refund-policy">returns</Link> and <Link className="text-white underline underline-offset-4" href="/privacy-policy">privacy</Link> policies for more information.</span>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
