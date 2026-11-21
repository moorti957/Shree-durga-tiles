'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, MapPin, MessageCircle, Phone, Truck, Gem, Layers } from 'lucide-react';
import Image from 'next/image';
import shreeDurgaLogo from '../../assets/shree-durga-mandala-transparent.png';
import { Container } from '@/components/ui/Container';
import marble from '../../assets/marble.jpg';
import granite from '../../assets/granite.jpg';
import designerTiles from '../../assets/designer-tiles.jpg';
import naturalStone from '../../assets/pure-white-marble.png';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/* ====== यहाँ अपना नंबर डालें (country code के साथ, बिना + के) ====== */
const WHATSAPP_NUMBER = '918529388726';
const CALL_NUMBER = '+918058285886';

/* Material swatches — असली फोटो आने तक CSS से बने हुए पत्थर के टेक्सचर */



const materials = [
  {
    key: 'Ceramic Tiles',
    label: 'Ceramic Tiles',
    image: marble,
  },
  {
    key: 'Gold Metallic Tiles',
    label: 'Gold Metallic Tiles',
    image: granite,
  },
  {
    key: 'PGVT Marble Tiles',
    label: 'PGVT Marble Tiles',
    image: designerTiles,
  },
  {
    key: 'Natural Tiles',
    label: 'Natural Tiles',
    image: naturalStone,
  },
];



const highlights = [
  { icon: Gem, title: 'Marble & Granite', text: 'Premium natural stone' },
  { icon: Layers, title: 'Designer Tiles', text: 'Floor, wall & elevation' },
  { icon: Truck, title: 'Pan India Delivery', text: 'Safe packing, on time' },
  { icon: MapPin, title: 'Naugaon Showroom', text: 'Visit & choose in person' },
];

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [material, setMaterial] = useState(materials[0].key);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const context = gsap.context(() => {
      gsap.fromTo(
        '.hero-reveal',
        { opacity: 0, y: reduce ? 0 : 30 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' },
      );
      if (!reduce) {
        gsap.to('.hero-mandala', {
          y: 60,
          ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 },
        });
      }
    }, heroRef);
    return () => context.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg =
      `Namaste Shree Durga Tiles,%0A` +
      `Mera naam ${encodeURIComponent(name || '-')} hai.%0A` +
      `Mujhe *${encodeURIComponent(material)}* ke baare mein quote chahiye.%0A` +
      `Phone: ${encodeURIComponent(phone || '-')}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      ref={heroRef}
      className="relative isolate overflow-hidden bg-[#0B0C0F] text-white"
    >
      {/* Background layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 500px at 85% 10%, rgba(201,162,92,.18), transparent 60%), radial-gradient(700px 500px at 0% 100%, rgba(201,162,92,.08), transparent 60%), linear-gradient(180deg,#0B0C0F 0%,#111216 100%)',
        }}
      />
      {/* faint marble veins */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(115deg, transparent 40%, #fff 40.2%, transparent 40.6%), linear-gradient(70deg, transparent 62%, #fff 62.15%, transparent 62.5%), linear-gradient(140deg, transparent 20%, #fff 20.1%, transparent 20.4%)',
        }}
      />
      <Image
        src={shreeDurgaLogo}
        alt=""
        aria-hidden="true"
        width={980}
        height={980}
        className="hero-mandala mandala-watermark mandala-spin pointer-events-none absolute -left-52 -top-24 h-[760px] w-[760px] object-contain opacity-[0.08]"
      />

      <Container className="relative z-10 grid items-center gap-12 pb-10 pt-28 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:pb-14 lg:pt-36">
        {/* ---------- LEFT: message ---------- */}
        <div className="max-w-2xl">
          <p className="hero-reveal mb-6 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-gold-light">
            <span className="h-px w-10 bg-gold-light" />
            Shree Durga Tiles · Nogawa
          </p>

          <h1 className="hero-reveal font-cinzel text-[clamp(44px,6vw,88px)] font-medium leading-[1] tracking-[-0.02em] text-white">
            Stone that shapes <em className="not-italic text-gold-light">your space.</em>
          </h1>

          <p className="hero-reveal mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Discover marble, granite, designer tiles and natural stone for every corner of your home and project.
          </p>

          <div className="hero-reveal mt-9 flex flex-wrap gap-3">
            <Link href="/products" className="btn-gold min-h-14 px-7">
              Explore materials <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/30 px-7 font-semibold text-white transition-colors hover:border-gold-light hover:text-gold-light"
            >
              Visit our showroom
            </Link>
          </div>

          <a
            href={`tel:${CALL_NUMBER}`}
            className="hero-reveal mt-8 inline-flex items-center gap-3 text-sm text-white/60 transition-colors hover:text-gold-light"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20">
              <Phone className="h-4 w-4" />
            </span>
            <span>
              Call us directly
              <span className="block text-base font-semibold tracking-wide text-white">{CALL_NUMBER}</span>
            </span>
          </a>
        </div>

        {/* ---------- RIGHT: quote card ---------- */}
        <div className="hero-reveal relative mx-auto w-full max-w-[480px]">
          {/* gold glow frame */}
          <div className="absolute -inset-px rounded-[28px] bg-gradient-to-br from-gold-light/60 via-white/5 to-gold-light/20" />
          <form
            onSubmit={handleSubmit}
            className="relative rounded-[27px] bg-[#14151A]/95 p-6 shadow-2xl backdrop-blur sm:p-8"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-light">Free quote</p>
            <h2 className="mt-2 font-cinzel text-2xl leading-tight text-white sm:text-[28px]">
              Tell us what you need
            </h2>
            <p className="mt-2 text-sm text-white/55">Pick a material — we reply on WhatsApp.</p>

            {/* Material swatches */}

            <div
              className="mt-6 grid grid-cols-4 gap-3"
              role="radiogroup"
              aria-label="Material"
            >
              {materials.map((m) => {
                const active = material === m.key;

                return (
                  <button
                    key={m.key}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMaterial(m.key)}
                    className="group min-w-0 text-center"
                  >
                    <span
                      className={`relative block aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 ${active
                          ? 'border-gold-light ring-2 ring-gold-light/40'
                          : 'border-white/15 group-hover:border-white/50'
                        }`}
                    >
                      <Image
                        src={m.image}
                        alt={m.label}
                        fill
                        sizes="100px"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      {active && (
                        <span className="absolute inset-0 bg-black/15" />
                      )}
                    </span>

                    <span
                      className={`mt-2 block text-[10px] font-semibold ${active ? 'text-gold-light' : 'text-white/60'
                        }`}
                    >
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>


            {/* Inputs */}
            <div className="mt-6 space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-black placeholder:text-black/35 focus:border-gold-light focus:outline-none"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
                autoComplete="tel"
                inputMode="tel"
                className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 text-sm text-black placeholder:text-black/35 focus:border-gold-light focus:outline-none"
              />
            </div>

            <button type="submit" className="btn-gold mt-5 min-h-14 w-full justify-center">
              <MessageCircle className="h-5 w-5" />
              Get quote on WhatsApp
            </button>
            <p className="mt-3 text-center text-[11px] text-white/40">No spam. Only your tile & stone enquiry.</p>
          </form>

          {/* floating blessing badge */}
          <div className="absolute -bottom-5 -right-3 hidden items-center gap-3 rounded-2xl border border-white/15 bg-[#151619] px-4 py-3 shadow-xl sm:flex">
            <span className="font-devanagari text-2xl text-gold-light">ॐ</span>
            <div>
              <p className="font-cinzel text-base leading-tight text-white">॥ जय माता दी ॥</p>
              <p className="mt-1 text-[9px] font-semibold tracking-[0.18em] text-gold-light">TILES · GRANITE · MARBLE</p>
            </div>
          </div>
        </div>
      </Container>

      {/* ---------- Bottom highlight bar ---------- */}
      <Container className="relative z-10 pb-10">
        <div className="hero-reveal grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
          {highlights.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 bg-[#0E0F13] px-4 py-5 sm:px-6">
              <Icon className="h-6 w-6 shrink-0 text-gold-light" />
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-0.5 text-xs text-white/50">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <a
          href="#shop-by-stone"
          className="mt-8 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/45 transition-colors hover:text-gold-light"
        >
          Discover our materials <ArrowDown className="h-4 w-4" />
        </a>
      </Container>
    </section>
  );
}