// frontend/src/components/layout/Footer.tsx

'use client';

import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Shield,
  Truck,
  Award,
  Heart,
} from 'lucide-react';
import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';

import { usePublicSettings } from '@/features/site/usePublicSettings';
import { trackVisitorEvent } from '@/services/visitorAnalytics';
import Image from "next/image";
import shreeDurgaLogo from "../../assets/shree-durga-tiles-logo.png";

// ============================================================
// Footer Component
// ============================================================
export default function Footer() {
  const { data: settings } = usePublicSettings();

  // Footer sections data
  const quickLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/products', label: 'Products' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/blogs', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
    { href: '/faq', label: 'FAQ' },
  ];

  const categoryLinks = [
    { href: '/marble-tiles-alwar', label: 'Marble Tiles' },
    { href: '/italian-marble-alwar', label: 'Italian Marble' },
    { href: '/granite-alwar', label: 'Granite' },
    { href: '/designer-tiles-alwar', label: 'Designer Tiles' },
    { href: '/bathroom-tiles-alwar', label: 'Bathroom Tiles' },
    { href: '/kitchen-tops-alwar', label: 'Kitchen Tops' },
    { href: '/mandir-marble-alwar', label: 'Mandir Marble' },
    { href: '/outdoor-stone-alwar', label: 'Outdoor Stone' },
    { href: '/tiles-shop-naugaon', label: 'Tiles Shop Naugaon' },
  ];

  const legalLinks = [
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/refund-policy', label: 'Refund Policy' },
    { href: '/shipping-policy', label: 'Shipping Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ];

  const socialLinks = [
    {
      name: 'Instagram',
      href: settings?.social?.instagram,
      icon: FaInstagram,
      color: 'hover:text-pink-500',
    },
    {
      name: 'YouTube',
      href: settings?.social?.youtube,
      icon: FaYoutube,
      color: 'hover:text-red-600',
    },
    {
      name: 'Facebook',
      href: settings?.social?.facebook,
      icon: FaFacebook,
      color: 'hover:text-blue-600',
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="site-footer relative overflow-hidden border-t border-white/10 bg-[#0A0B0D] text-white/70"
    >    {/* Decorative elements */}
      <div className="toran" aria-hidden="true" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />
      </div>

      <div className="relative z-10">
        {/* Main Footer */}
        <div className="container pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand & About */}
            <div className="space-y-4">
             
<Link
  href="/"
  className="inline-flex shrink-0 items-center"
  aria-label="Shree Durga Tiles home"
>
  <div className="rounded-lg bg-white px-2 py-1.5">
    <Image
      src={shreeDurgaLogo}
      alt="Shree Durga Tiles - Tiles, Granite and Marble"
      width={440}
      height={147}
      className="h-12 w-auto max-w-[220px] object-contain sm:h-14 sm:max-w-[250px]"
    />
  </div>
</Link>

              <p className="max-w-sm text-sm leading-relaxed text-white/65">
               Premium marble, granite, tiles and natural stone for kitchens, living spaces, projects and pooja rooms. Visit our showroom in Naugaon, Alwar.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <Shield className="w-4 h-4" />
                  <span>Material selection</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <Truck className="w-4 h-4" />
                  <span>Project delivery</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/50">
                  <Award className="w-4 h-4" />
                  <span>Expert Guidance</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.filter((social) => Boolean(social.href)).map((social) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-9 h-9 rounded-full bg-white/10 flex items-center justify-center transition-all hover:bg-white/20 ${social.color}`}
                      aria-label={social.name}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="mb-4 font-cinzel text-lg font-semibold text-white">
                Explore
              </h4>
              <ul className="space-y-2.5">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-gold"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div>
              <h4 className="mb-4 font-cinzel text-lg font-semibold text-white">
                Materials
              </h4>
              <ul className="space-y-2.5">
                {categoryLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-gold"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/categories"
                    className="text-gold hover:text-gold-light transition-colors text-sm font-medium flex items-center gap-1.5 group"
                  >
                    <ArrowRight className="w-3 h-3" />
                    View All Materials
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact & Newsletter */}
            <div>
              <h4 className="mb-4 font-cinzel text-lg font-semibold text-white">
                Get In Touch
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3 text-white/60">
                  <MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span>Delhi–Alwar Road, Near Kapoor Dharamshala, Naugaon, Alwar, Rajasthan, India</span>
                </li>
                <li className="flex items-center gap-3 text-white/60">
                  <Phone className="w-4 h-4 text-gold shrink-0" />
                  <a
                    href="tel:+918529388726"
                    onClick={() => void trackVisitorEvent('call_click')}
                    className="hover:text-gold transition-colors"
                  >
                    +91 85293 88726
                  </a>
                </li>
                <li className="flex items-center gap-3 text-white/60">
                  <Phone className="w-4 h-4 text-gold shrink-0" />
                  <a
                    href="tel:+918058285886"
                    onClick={() => void trackVisitorEvent('call_click')}
                    className="hover:text-gold transition-colors"
                  >
                    +91 80582 85886
                  </a>
                </li>
                <li className="flex items-center gap-3 text-white/60">
                  <Mail className="w-4 h-4 text-gold shrink-0" />
                  <a href="mailto:dileepsaini8726@gmail.com" className="hover:text-gold transition-colors">
                    dileepsaini8726@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-3 text-white/60">
                  <Clock className="w-4 h-4 text-gold shrink-0" />
                  <span>Open 24 hours, 7 days a week</span>
                </li>
              </ul>

              <Link href="/contact" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-5 text-sm font-semibold text-brown hover:bg-gold-light">
                Ask for a project quote <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-gold" />
                </div>
                <p className="text-xs text-white/60">Materials for every space</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gold" />
                </div>
                <p className="text-xs text-white/60">Compare in our showroom</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-gold" />
                </div>
                <p className="text-xs text-white/60">Pan India delivery</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-gold" />
                </div>
                <p className="text-xs text-white/60">Support for your project</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
         <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row">
  <div className="text-center md:text-left">
    &copy; {currentYear} Shree Durga Tiles. All rights reserved.
  </div>

  <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
    {legalLinks.map((link) => (
      <Link
        key={link.href}
        href={link.href}
        className="text-brown-light hover:text-gold dark:text-white/60 dark:hover:text-gold transition-colors"
      >
        {link.label}
      </Link>
    ))}
  </div>

  <div className="flex items-center gap-1 text-brown-light dark:text-white/60">
    <span className="font-devanagari text-gold-light">॥ जय माता दी ॥</span>
  </div>
</div>
        </div>
      </div>
    </footer>
  );
}