'use client';

import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Container } from '@/components/ui/Container';

export function Newsletter() {
  return (
    <section className="bg-gradient-to-r from-brown-dark via-brown to-brown-dark py-16 text-white md:py-20">
      <Container className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-gold-light">Project support</p>
          <h2 className="font-cinzel text-gold text-3xl font-semibold">Need help choosing a material?</h2>
          <p className="mt-2 max-w-2xl text-white/70">Tell us about your space and our team will help you compare options.</p>
        </div>
        <Link href="/contact" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-gold px-6 font-semibold text-brown hover:bg-gold-light">
          <MessageCircle className="h-4 w-4" /> Request guidance <ArrowRight className="h-4 w-4" />
        </Link>
      </Container>
    </section>
  );
}

export default Newsletter;
