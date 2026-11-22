// frontend/src/app/shipping-policy/page.tsx

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import  Container  from '../../components/ui/Container';
import  GlassCard  from '../../components/ui/GlassCard';
import {
  ArrowLeft,
  Truck,
  Clock,
  MapPin,
  Globe,
  Package,
  Shield,
  CreditCard,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// ============================================================
// Shipping Policy Page
// ============================================================
export default function ShippingPolicyPage() {
  return (
    <div className="bg-ivory dark:bg-brown min-h-screen py-12 md:py-20">
      <Container>
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brown-light dark:text-ivory/60 hover:text-gold-dark dark:hover:text-gold transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-gold-dark dark:text-gold" />
              </div>
              <span className="tag">✦ Safe &amp; Secure Delivery</span>
            </div>
            <h1 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold text-brown dark:text-ivory">
              Shipping Policy
            </h1>
            <p className="text-brown-light dark:text-ivory/60 mt-3 text-sm md:text-base max-w-2xl">
              Last updated: {'{{TODO: confirm shipping policy review date}}'}
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Introduction */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-3">
                Our Shipping Commitment
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                At Shree Durga Tiles, we understand that stone and tile orders need careful handling.
                We take care in packing orders and arranging delivery to your location.
              </p>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed mt-3">
                This Shipping Policy outlines our shipping methods, costs, delivery times, and related
                information to help you understand what to expect when you order from us.
              </p>
            </GlassCard>

            {/* Shipping Destinations */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Globe className="w-5 h-5 text-gold-dark dark:text-gold" />
                Shipping Destinations
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                We provide delivery across India for stone and tile orders.
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>
                  <strong>Domestic (India):</strong> All states and union territories across India.
                </li>
              </ul>
              <p className="text-brown-light dark:text-ivory/70 text-sm mt-3">
                Contact us to confirm delivery availability for your pincode and project requirements.
              </p>
            </GlassCard>

            {/* Shipping Methods & Delivery Times */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-gold-dark dark:text-gold" />
                Shipping Methods &amp; Delivery Times
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                Delivery arrangements and estimated timelines depend on the material, order size and destination.
                Contact us with your pincode and requirements to confirm the available option.
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gold/10 dark:border-gold/5">
                      <th className="text-left py-2 font-semibold text-brown dark:text-ivory">Delivery area</th>
                      <th className="text-left py-2 font-semibold text-brown dark:text-ivory">Timeline</th>
                      <th className="text-left py-2 font-semibold text-brown dark:text-ivory">Charges</th>
                    </tr>
                  </thead>
                  <tbody className="text-brown-light dark:text-ivory/70">
                    <tr className="border-b border-gold/5 dark:border-gold/5">
                      <td className="py-2"><strong>Across India</strong></td>
                      <td className="py-2">Confirmed for your order</td>
                      <td className="py-2">Shared before order confirmation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Order Processing Time */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-gold-dark dark:text-gold" />
                Order Processing Time
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                Preparation and dispatch timing depends on material availability and project requirements.
                We confirm the expected schedule when discussing your order.
              </p>
            </GlassCard>

            {/* Shipping Costs */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <CreditCard className="w-5 h-5 text-gold-dark dark:text-gold" />
                Shipping Costs
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                Delivery charges depend on the material, order volume and destination. We share the
                applicable delivery and tax details with you before confirming an order.
              </p>
            </GlassCard>

            {/* Tracking Information */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-gold-dark dark:text-gold" />
                Tracking Your Order
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                When carrier tracking is available for a delivery, we share the tracking details after dispatch.
              </p>
            </GlassCard>

            {/* International Shipping */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-gold-dark dark:text-gold" />
                Delivery Across India
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                We discuss delivery availability for your pincode, material and project quantity before confirming an order.
              </p>
            </GlassCard>

            {/* Shipping Address */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-gold-dark dark:text-gold" />
                Shipping Address Accuracy
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                Please ensure that your shipping address is accurate and complete to avoid delivery issues:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>Include full name, street address, apartment/suite number, city, state/province, pincode, and country.</li>
                <li>Provide a valid phone number for delivery updates.</li>
                <li>
                  If you need to change your shipping address after placing an order, please contact us immediately.
                  We cannot modify the address once the order has been shipped.
                </li>
              </ul>
            </GlassCard>

            {/* Delivery Delays */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-gold-dark dark:text-gold" />
                Delivery Delays
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                While we strive to ensure timely delivery, sometimes delays may occur due to:
              </p>
              <ul className="list-disc list-inside text-brown-light dark:text-ivory/70 text-sm mt-3 space-y-1.5 ml-4">
                <li>Weather conditions and natural disasters</li>
                <li>Customs clearance procedures</li>
                <li>Carrier operational issues</li>
                <li>High volume periods (holidays, festivals)</li>
                <li>Incorrect address or incomplete delivery information</li>
              </ul>
              <p className="text-brown-light dark:text-ivory/70 text-sm mt-3">
                If your delivery is delayed, please check your tracking information or contact us for assistance.
              </p>
            </GlassCard>

            {/* Packaging */}
            <GlassCard variant="default" hover={false}>
              <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-gold-dark dark:text-gold" />
                Premium Packaging
              </h2>
              <p className="text-brown-light dark:text-ivory/70 text-sm leading-relaxed">
                Packaging arrangements depend on the material and delivery route. Please discuss handling requirements with us before ordering.
              </p>
            </GlassCard>

            {/* Contact Us */}
            <GlassCard variant="gold" hover={false}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-cinzel text-xl font-bold text-brown dark:text-ivory mb-2 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gold-dark dark:text-gold" />
                    Need Help with Shipping?
                  </h2>
                  <p className="text-brown-light dark:text-ivory/70 text-sm">
                    If you have any questions about shipping, delivery, or tracking, please don&apos;t hesitate to contact us:
                  </p>
                  <div className="mt-2 space-y-1 text-sm text-brown-light dark:text-ivory/70">
                    <p>
                      <strong>Email:</strong>{' '}
                      <a
                        href="mailto:dileepsaini8726@gmail.com"
                        className="text-gold-dark dark:text-gold hover:text-gold transition-colors"
                      >
                        dileepsaini8726@gmail.com
                      </a>
                    </p>
                    <p>
                      <strong>WhatsApp:</strong>{' '}
                      <a
                        href="https://wa.me/918529388726"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold-dark dark:text-gold hover:text-gold transition-colors"
                      >
                        +91 85293 88726
                      </a>
                    </p>
                    <p>
                      <strong>Phone:</strong>{' '}
                      <a
                        href="tel:+918529388726"
                        className="text-gold-dark dark:text-gold hover:text-gold transition-colors"
                      >
                        +91 85293 88726
                      </a>
                    </p>
                    <p>
                      <strong>Business Hours:</strong> Open 24 hours, 7 days a week
                    </p>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="btn-gold whitespace-nowrap text-sm"
                >
                  Contact Support
                </Link>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </Container>
    </div>
  );
}