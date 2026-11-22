'use client';

import { useState, type FormEvent } from 'react';
import { Loader2, Send } from 'lucide-react';
import { toast } from '@/lib/notifications';
import {
  submitEnquiry,
  type EnquiryNeed,
  type EnquirySource,
} from '@/services/publicSiteApi';

const enquiryNeeds: EnquiryNeed[] = [
  'Marble',
  'Granite',
  'Floor/Wall Tiles',
  'Kitchen Top',
  'Mandir/Pooja Room Stone',
  'Bulk supply for a project',
  'Other',
];

interface EnquiryFormProps {
  source?: EnquirySource;
  productId?: string;
  defaultNeed?: EnquiryNeed;
  compact?: boolean;
}

export function EnquiryForm({
  source = 'quote_form',
  productId,
  defaultNeed = 'Other',
  compact = false,
}: EnquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');
    const form = event.currentTarget;
    const formData = new FormData(form);
    const phone = String(formData.get('phone') || '').trim();
    const phoneDigits = phone.replace(/\D/g, '');
    const normalizedPhone = phoneDigits.startsWith('91') && phoneDigits.length === 12
      ? phoneDigits.slice(2)
      : phoneDigits;

    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      setErrorMessage('Enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitEnquiry({
        name: String(formData.get('name') || '').trim(),
        phone,
        need: String(formData.get('need') || defaultNeed) as EnquiryNeed,
        message: String(formData.get('message') || '').trim(),
        productId,
        source,
        website: String(formData.get('website') || ''),
      });
      setSuccess(true);
      form.reset();
      toast.success('Enquiry sent', 'Our team will contact you shortly.');
    } catch (error) {
      const message =
        error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
          ? error.message
          : 'Please try again in a moment.';
      setErrorMessage(message);
      toast.error('We couldn’t send your enquiry', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div role="status" className="rounded-2xl border border-green-200 bg-green-50 p-5 text-green-900">
        <h3 className="font-semibold">Thank you for your enquiry.</h3>
        <p className="mt-1 text-sm">Our team will call you to discuss your requirement.</p>
        <button type="button" onClick={() => setSuccess(false)} className="mt-3 min-h-11 font-semibold underline underline-offset-4">
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-brown">
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            className="mt-1 w-full rounded-xl border border-stone-line bg-white px-3 py-2.5 font-normal"
          />
        </label>
        <label className="block text-sm font-medium text-brown">
          Mobile number
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            maxLength={20}
            placeholder="+91 85293 88726"
            className="mt-1 w-full rounded-xl border border-stone-line bg-white px-3 py-2.5 font-normal"
          />
        </label>
      </div>
      <label className="block text-sm font-medium text-brown">
        What are you looking for?
        <select
          name="need"
          defaultValue={defaultNeed}
          className="mt-1 w-full rounded-xl border border-stone-line bg-white px-3 py-2.5 font-normal"
        >
          {enquiryNeeds.map((need) => <option key={need} value={need}>{need}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium text-brown">
        Project details
        <textarea
          name="message"
          rows={compact ? 3 : 4}
          maxLength={3000}
          placeholder="Share your project, material or quantity requirements."
          className="mt-1 w-full rounded-xl border border-stone-line bg-white px-3 py-2.5 font-normal"
        />
      </label>
      <label aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        Leave this field empty
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      {errorMessage && <p role="alert" className="text-sm text-red-700">{errorMessage}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-maroon px-6 font-semibold text-white transition hover:bg-maroon-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {isSubmitting ? 'Sending…' : 'Send enquiry'}
      </button>
    </form>
  );
}
