'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Input } from '@/components/ui/Input';

const faqItems = [
  {
    id: 'delivery',
    category: 'Delivery',
    question: 'Do you deliver outside Rajasthan?',
    answer: 'Yes. We offer Pan India delivery, with safe packing for stone and tiles so they reach your site in good condition.',
  },
  {
    id: 'visit',
    category: 'Showroom',
    question: 'Can I see the stone before I order?',
    answer: 'Please visit our showroom in Govindgarh, Alwar, or call us. Our team can help you compare options and finishes in person.',
  },
  {
    id: 'bulk',
    category: 'Projects',
    question: 'Do you supply for builders and bulk projects?',
    answer: 'Yes. Contact us with your project requirements to discuss bulk supply and pricing.',
  },
  {
    id: 'materials',
    category: 'Products',
    question: 'What products do you sell?',
    answer: 'We offer marble, granite, tiles, quartz, kitchen tops, outdoor flooring, wall cladding, sanitaryware and bath fittings.',
  },
  {
    id: 'price',
    category: 'Pricing',
    question: 'How do I get a price?',
    answer: 'Use the quote form or call us with your requirement and approximate area. We will discuss options and pricing.',
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [openItems, setOpenItems] = useState<Set<string>>(() => new Set(['delivery']));
  const categories = ['All', ...new Set(faqItems.map(({ category }) => category))];
  const filteredFaqs = useMemo(() => faqItems.filter((item) => {
    const matchesText = `${item.question} ${item.answer}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesText && matchesCategory;
  }), [activeCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenItems((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-ivory">
      <section className="bg-brown-dark py-16 text-white md:py-20">
        <Container>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-light">Questions</p>
          <h1 className="font-cinzel text-5xl font-medium text-white sm:text-6xl">Good to know before you visit.</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/70">Find answers about our showroom, products, projects and delivery.</p>
        </Container>
      </section>

      <Container className="grid gap-10 py-12 md:py-16 lg:grid-cols-[0.7fr_1.3fr]">
        <aside>
          <label htmlFor="faq-search" className="mb-2 block text-sm font-semibold text-brown">Search questions</label>
          <div className="relative">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brown-light" />
            <Input id="faq-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search..." className="pl-10" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2 lg:flex-col" aria-label="Filter questions by topic">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
                className={`min-h-11 rounded-full border px-4 text-left text-sm font-semibold transition-colors lg:rounded-xl ${activeCategory === category ? 'border-brown bg-brown text-white' : 'border-stone-line bg-white text-brown hover:bg-sand'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </aside>

        <div className="space-y-3">
          {filteredFaqs.length ? filteredFaqs.map((item) => {
            const isOpen = openItems.has(item.id);
            return (
              <article key={item.id} className="overflow-hidden rounded-[18px] border border-stone-line bg-white">
                <h2>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${item.id}`}
                    onClick={() => toggleItem(item.id)}
                    className="flex min-h-[68px] w-full items-center justify-between gap-5 px-5 py-4 text-left font-semibold text-brown sm:px-6"
                  >
                    <span>{item.question}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brown text-xl leading-none text-gold-light">{isOpen ? '−' : '+'}</span>
                  </button>
                </h2>
                {isOpen && (
                  <div id={`faq-answer-${item.id}`} className="border-t border-stone-line px-5 pb-5 pt-4 leading-relaxed text-brown-light sm:px-6">
                    {item.answer}
                  </div>
                )}
              </article>
            );
          }) : (
            <div className="rounded-3xl border border-dashed border-stone-line bg-white p-8 text-center text-brown-light">No questions match your search.</div>
          )}
        </div>
      </Container>
    </div>
  );
}
