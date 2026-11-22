// frontend/src/app/contact/page.tsx

'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { EnquiryForm } from '@/components/forms/EnquiryForm';
import { usePublicSettings } from '@/features/site/usePublicSettings';
import { trackVisitorEvent } from '@/services/visitorAnalytics';

// ============================================================
// Contact Page
// ============================================================
export default function ContactPage() {
  const { data: settings } = usePublicSettings();

  // Contact details
  const contactDetails = [
    {
      icon: <MapPin className="w-5 h-5 text-gold-dark" />,
      label: 'Address',
      value: 'Delhi–Alwar Road, Near Kapoor Dharamshala, Naugaon, Alwar, Rajasthan, India',
    },
    {
      icon: <Phone className="w-5 h-5 text-gold-dark" />,
      label: 'Phone 1',
      value: '+91 85293 88726',
      link: 'tel:+918529388726',
    },
    {
      icon: <Phone className="w-5 h-5 text-gold-dark" />,
      label: 'Phone 2',
      value: '+91 80582 85886',
      link: 'tel:+918058285886',
    },
    {
      icon: <Mail className="w-5 h-5 text-gold-dark" />,
      label: 'Email',
      value: 'dileepsaini8726@gmail.com',
      link: 'mailto:dileepsaini8726@gmail.com',
    },
    {
      icon: <Clock className="w-5 h-5 text-gold-dark" />,
      label: 'Working Hours',
      value: 'Open 24 hours, 7 days a week',
    },
  ];

  return (
    <div className="bg-ivory min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-br from-brown via-brown-dark to-brown text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-gold/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-gold/20 blur-3xl" />
        </div>
        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="tag bg-white/20 text-white backdrop-blur-sm border-white/30">
              Get a free quote
            </span>
            <h1 className="font-cinzel text-gold text-4xl md:text-5xl font-bold mt-4">
              Contact Shree Durga Tiles in Naugaon, Alwar
            </h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto mt-4">
              Tell us about your project or visit our showroom in Naugaon, Alwar.               We&apos;ll help you compare materials and finishes.
            </p>
          </motion.div>
        </Container>
      </section>

      {/* Contact Content */}
      <Container className="py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gold/5 h-full">
              <h2 className="font-cinzel text-2xl font-bold text-brown mb-6">
                Reach Out to Us
              </h2>
              <p className="text-brown-light text-sm mb-8">
                Ask us about marble, granite, tiles, quartz, kitchen tops, outdoor flooring or bulk project supply.
              </p>
              <div className="mb-8 flex flex-wrap gap-3">
                <a href="tel:+918529388726" onClick={() => void trackVisitorEvent('call_click')} className="btn-maroon">Call +91 85293 88726</a>
                <a href="https://wa.me/918529388726?text=Hello%20Shree%20Durga%20Tiles%2C%20I%20want%20a%20quote%20for%20marble%2Ftiles." target="_blank" rel="noopener noreferrer" onClick={() => void trackVisitorEvent('whatsapp_click')} className="btn-gold">WhatsApp us</a>
              </div>

              <div className="space-y-6">
                {contactDetails.map((detail) => (
                  <div key={detail.label} className="flex items-start gap-4">
                    <div className="shrink-0 mt-1">{detail.icon}</div>
                    <div>
                      <p className="text-xs text-brown-light/60 uppercase tracking-wider">
                        {detail.label}
                      </p>
                      {detail.link ? (
                        <a
                          href={detail.link}
                          onClick={() => detail.label === 'Phone' && void trackVisitorEvent('call_click')}
                          className="text-brown hover:text-gold-dark transition-colors"
                        >
                          {detail.value}
                        </a>
                      ) : (
                        <p className="text-brown">{detail.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Social / Quick links */}
              {(settings?.social?.instagram || settings?.social?.youtube || settings?.social?.facebook) && (
                <div className="mt-8 border-t border-gold/10 pt-6">
                  <p className="mb-3 text-xs uppercase tracking-wider text-brown-light/60">Follow Us</p>
                  <div className="flex gap-3">
                  {settings?.social?.instagram && (
                  <a
                    href={settings.social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-sand/50 flex items-center justify-center text-brown-light hover:bg-gold hover:text-white transition-colors"
                    aria-label="Instagram"
                  >
                    <span className="sr-only">Instagram</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                  )}
                  {settings?.social?.youtube && (
                  <a
                    href={settings.social.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-sand/50 flex items-center justify-center text-brown-light hover:bg-gold hover:text-white transition-colors"
                    aria-label="YouTube"
                  >
                    <span className="sr-only">YouTube</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                  )}
                  {settings?.social?.facebook && (
                  <a
                    href={settings.social.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 rounded-full bg-sand/50 flex items-center justify-center text-brown-light hover:bg-gold hover:text-white transition-colors"
                    aria-label="Facebook"
                  >
                    <span className="sr-only">Facebook</span>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gold/5">
              <h2 className="font-cinzel text-2xl font-bold text-brown mb-6">
                Request a Quote
              </h2>

              <EnquiryForm source="quote_form" />
            </div>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16"
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gold/5">
            <div className="relative w-full h-80 md:h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!3m2!1sen!2sin!4v1794917945184!5m2!1sen!2sin!6m8!1m7!1sxVgMyr2VSArZqm3tDUF0Fw!2m2!1d27.66274276624874!2d76.88995414123757!3f121.87208134808108!4f9.741027818123229!5f0.5116561315763384"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Google Map to Shree Durga Tiles, Delhi–Alwar Road, Naugaon, Alwar"
              />
            </div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}