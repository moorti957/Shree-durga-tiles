'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, MessageCircle, Phone, Search, X } from 'lucide-react';
import { usePublicSettings } from '@/features/site/usePublicSettings';
import { trackVisitorEvent } from '@/services/visitorAnalytics';
import Image from "next/image";
import shreeDurgaLogo from "../../assets/shree-durga-tiles-logo.png";

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/categories', label: 'Collections' },
  { href: '/products', label: 'Catalogue' },
  { href: '/products?search=mandir', label: 'Mandir Stone' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

function TrishulMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" className="h-9 w-9 text-gold-light" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 5v39M12 12v7c0 5 5 8 12 8s12-3 12-8v-7M24 5l-3 6h6zM12 6l-2.5 6h5zM36 6l-2.5 6h5zM19 40h10" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: settings } = usePublicSettings();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    router.push(`/products?search=${encodeURIComponent(query)}`);
    setSearch('');
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  const phone = settings?.phone || '+918529388726';
  const phoneHref = `tel:${phone.replace(/[^\d+]/g, '')}`;
  const whatsapp = (settings?.whatsapp || phone).replace(/\D/g, '');

  const openWhatsApp = () => {
    void trackVisitorEvent('whatsapp_click');
    window.open(`https://wa.me/${whatsapp}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-all ${
      isScrolled ? 'border-stone-line bg-white/95 shadow-sm backdrop-blur' : 'border-white/10 bg-white/90 backdrop-blur'
    }`}>
      <div className="container flex min-h-16 items-center justify-between gap-4 py-2">
       

<Link
  href="/"
  className="flex shrink-0 items-center"
  aria-label="Shree Durga Tiles home"
>
  <Image
    src={shreeDurgaLogo}
    alt="Shree Durga Tiles - Marble, Granite and Tiles"
    width={440}
    height={147}
    priority
    className="h-12 w-auto max-w-[190px] object-contain sm:h-14 sm:max-w-[230px]"
  />
</Link>



        <nav className="hidden items-center gap-5 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold transition-colors hover:text-gold-dark ${
                pathname === link.href.split('?')[0] ? 'text-maroon' : 'text-brown'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search catalogue"
                aria-label="Search catalogue"
                className="w-40 rounded-l-full border border-stone-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
              />
              <button type="submit" className="rounded-r-full bg-sand p-2.5" aria-label="Submit search">
                <Search className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <button type="button" onClick={() => setIsSearchOpen(true)} className="rounded-full p-2 hover:bg-sand" aria-label="Search catalogue">
              <Search className="h-5 w-5" />
            </button>
          )}
          <a
            href={phoneHref}
            onClick={() => void trackVisitorEvent('call_click')}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-brown px-4 text-sm font-semibold text-brown hover:bg-brown hover:text-white"
          >
            <Phone className="h-4 w-4" /> Call
          </a>
          <button type="button" onClick={openWhatsApp} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-maroon px-4 text-sm font-semibold text-white hover:bg-maroon-dark">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-brown hover:bg-sand lg:hidden"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-stone-line bg-white px-5 pb-6 pt-3 shadow-lg lg:hidden"
          >
            <form onSubmit={handleSearch} className="mb-3 flex gap-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search marble, granite, tiles…"
                aria-label="Search catalogue"
                className="min-w-0 flex-1 rounded-full border border-stone-line px-4 py-2.5 text-sm"
              />
              <button type="submit" className="rounded-full bg-sand p-3" aria-label="Submit search">
                <Search className="h-4 w-4" />
              </button>
            </form>
            <nav className="grid" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="border-b border-stone-line py-3 font-medium text-brown">
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <a href={phoneHref} onClick={() => void trackVisitorEvent('call_click')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-brown font-semibold text-brown">
                <Phone className="h-4 w-4" /> Call
              </a>
              <button type="button" onClick={openWhatsApp} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-maroon font-semibold text-white">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
