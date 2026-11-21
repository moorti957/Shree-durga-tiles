'use client';

import Link from 'next/link';
import { ArrowRight, Check, Gem, MapPin, ShieldCheck, Truck } from 'lucide-react';
import outdoor from "../../assets/showroom-banner.png";
import { Container } from '@/components/ui/Container';
import Image from "next/image";

const commitments = [
  {
    icon: <Gem className="h-6 w-6" />,
    title: 'A wide material range',
    description: 'Explore marble, granite, tiles, quartz and natural stone for different spaces and applications.',
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: 'Guidance you can use',
    description: 'Compare finishes and talk through your project needs with our showroom team.',
  },
  {
    icon: <Truck className="h-6 w-6" />,
    title: 'Delivery across India',
    description: 'Ask us about packing and delivery options for your location and project.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-ivory">
      <section className="relative overflow-hidden bg-brown-dark py-16 text-white md:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_30%,rgba(176,141,87,.18),transparent_38%)]" aria-hidden="true" />
        <Container className="relative">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-gold-light">About Shree Durga Tiles</p>
          <h1 className="max-w-3xl font-cinzel text-5xl font-medium leading-tight text-white sm:text-6xl">Stone for the spaces <em className="text-gold-light">you call home.</em></h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/70">A showroom for marble, granite, tiles and natural stone in Naugaon, Alwar.</p>
        </Container>
      </section>

      <section className="section-padding">
        <Container className="grid items-center gap-12 lg:grid-cols-2">
          <div className="tx-granite relative isolate flex min-h-[440px] items-end overflow-hidden rounded-t-[999px] rounded-b-[28px] border border-gold p-7 shadow-[0_0_0_8px_var(--stone-50),0_0_0_9px_rgba(176,141,87,.4)]">

  <Image
    src={outdoor}
    alt="Shree Durga Tiles Showroom"
    fill
    priority
    sizes="(max-width: 1024px) 100vw, 50vw"
    className="z-0 object-cover object-center transition-transform duration-700 hover:scale-105"
  />

  {/* Dark Overlay */}
  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

  {/* Image Label */}
  <span className="relative z-20 rounded-full border border-white/50 bg-black/50 px-4 py-2 text-xs font-bold tracking-wider text-white backdrop-blur-sm">
    SHREE DURGA TILES SHOWROOM
  </span>

</div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-dark">Our showroom</p>
            <h2 className="section-title">A trusted name in <em className="text-gold-dark">stone &amp; tile</em></h2>
            <div className="mt-5 space-y-4 leading-relaxed text-brown-light">
              <p>Shree Durga Tiles brings together a broad selection of marble, granite, tiles, quartz and natural stone for residential, commercial and industrial projects.</p>
              <p>Visit us in Naugaon to compare designs, textures and finishes. Our team can help you think through material choices for flooring, kitchens, walls, outdoor areas and mandir spaces.</p>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-brown">
              {['Flooring and wall finishes', 'Kitchen tops and counters', 'Outdoor paving and wall cladding', 'Sanitaryware and bath fittings'].map((item) => (
                <p key={item} className="flex items-center gap-3"><Check className="h-4 w-4 text-gold-dark" />{item}</p>
              ))}
            </div>
            <p className="mt-7 flex items-center gap-2 text-sm text-brown-light"><MapPin className="h-4 w-4 text-gold-dark" />Delhi–Alwar Road, Near Kapoor Dharamshala, Naugaon, Alwar, Rajasthan, India.</p>
            <Link href="/contact" className="btn-maroon mt-7">Visit or contact us <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </Container>
      </section>

      <section className="bg-sand/60 py-16 md:py-20">
        <Container>
          <div className="mb-10 max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-dark">Why Shree Durga Tiles</p>
            <h2 className="section-title">Help for every surface and project</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {commitments.map((item) => (
              <article key={item.title} className="rounded-3xl border border-stone-line bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brown text-gold-light">{item.icon}</span>
                <h3 className="mt-5 font-cinzel text-2xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brown-light">{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-padding">
        <Container className="flex flex-col items-start justify-between gap-6 rounded-[28px] bg-[#241110] p-8 text-white sm:flex-row sm:items-center sm:p-12">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#E2BE86]">Find the right material</p>
            <h2 className="max-w-2xl font-cinzel text-3xl font-semibold text-white sm:text-4xl">Let&apos;s talk about what your space needs.</h2>
          </div>
          <Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-[#E2BE86] px-6 font-bold text-[#241110]">Get in touch <ArrowRight className="h-4 w-4" /></Link>
        </Container>
      </section>
    </div>
  );
}
