'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, Play } from 'lucide-react';
import Image from "next/image";
import shreeDurgaLogo from "../../assets/shree-durga-mandala-transparent.png";
import { Container } from '@/components/ui/Container';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const petalRotations = Array.from({ length: 12 }, (_, index) => index * 30);

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [playVideo, setPlayVideo] = useState(false);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        [titleRef.current, imageRef.current],
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.18, ease: 'power3.out' },
      );
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.to(imageRef.current, {
          y: 22,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
    }, heroRef);

    return () => context.revert();
  }, []);

  return (
    <section ref={heroRef} className="hero-section relative isolate min-h-[720px] overflow-hidden bg-[#0E0F12] text-white">
      <div className="hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      
<Image
   src={shreeDurgaLogo}
  alt=""
  aria-hidden="true"
  width={980}
  height={980}
  className="
    mandala-watermark
    mandala-spin
    pointer-events-none
    absolute
    -right-36
    top-8
    h-[880px]
    w-[880px]
    object-contain
    opacity-30
  "
/>


      <Container className="relative z-10 grid min-h-[720px] items-center gap-12 pb-16 pt-28 lg:grid-cols-[1fr_0.82fr] lg:pb-20 lg:pt-36">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gold-light">
            <span className="h-px w-8 bg-gold-light" /> Shree Durga Tiles · Govindgarh
          </p>
          <h1 ref={titleRef} className="font-cinzel text-[clamp(46px,6.4vw,92px)] font-medium leading-[0.98] tracking-[-0.02em] text-white">
            Stone that shapes <em className="text-gold-light">your space.</em>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Discover marble, granite, designer tiles and natural stone for every corner of your home and project.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn-gold min-h-14 px-7">
              Explore materials <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-white/40 px-7 font-semibold text-white transition-colors hover:border-gold-light hover:text-gold-light">
              Visit our showroom
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/60">
            <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold-light" />Marble &amp; granite</span>
            <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold-light" />Designer tiles</span>
            <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-gold-light" />Pan India delivery</span>
          </div>
          <a href="#shop-by-stone" className="mt-10 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/50 hover:text-gold-light">
            Discover our materials <ArrowDown className="h-4 w-4" />
          </a>
        </div>

        <div ref={imageRef} className="relative mx-auto w-full max-w-[470px]">
          <div className="absolute -inset-3 rounded-t-[999px] rounded-b-[34px] border border-gold-light/50" />
          <div className="hero-stone tx-marble relative flex aspect-[0.78] items-end justify-center overflow-hidden rounded-t-[999px] rounded-b-[28px] border border-white/20 p-7">
            {playVideo ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/UsCcS0JMZCg?autoplay=1&mute=1&rel=0&playsinline=1"
                title="Shree Durga Tiles showroom video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10" />
                <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/25 text-white backdrop-blur-sm">
                  <Play className="ml-1 h-6 w-6 fill-current" />
                </span>
                <button
                  type="button"
                  onClick={() => setPlayVideo(true)}
                  aria-label="Play showroom video"
                  className="absolute inset-0 z-10 rounded-t-[999px] rounded-b-[28px]"
                />
                <div className="relative z-0 max-w-[260px] rounded-full border border-dashed border-white/80 bg-black/35 px-5 py-3 text-center text-xs font-bold tracking-[0.12em] text-white">
                  SHOWROOM PHOTOGRAPHY COMING SOON
                </div>
              </>
            )}
          </div>
          <div className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#151619] px-4 py-3 shadow-xl">
            <span className="font-devanagari text-2xl text-gold-light">ॐ</span>
            <div>
              <p className="font-cinzel text-lg leading-tight text-white">॥ जय माता दी ॥</p>
              <p className="mt-1 text-[9px] font-semibold tracking-[0.18em] text-gold-light">TILES · GRANITE · MARBLE</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
