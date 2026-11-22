'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Lenis from 'lenis';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Check,
  Headset,
  Layers3,
  MapPin,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import Image from "next/image";
import shreeDurga from "../../assets/pure-white-marble.png";
import shreeDurga1 from "../../assets/warm-ivory-stone.png";
import kitchenGranite from "../../assets/kitchen-granite.jpg";
import bathroomTiles from "../../assets/bathroom-tiles.jpg";
import wallCladding from "../../assets/wall-cladding.jpg";
import outdoorFlooring from "../../assets/outdoor-flooring1.jpg";
import residentialImg from "../../assets/residential.jpg";
import commercialImg from "../../assets/commercial.jpg";
import templeImg from "../../assets/temple.jpg";
import outdoorImg from "../../assets/outdoor.jpg";
import outdoor from "../../assets/showroom-banner.png";
import designerTiles from "../../assets/designer-tiles.jpg";


import Hero from '../hero/Hero';
import FeaturedCategories from '../sections/FeaturedCategories';
import Newsletter from '../sections/Newsletter';
import FAQAccordion from '../sections/FAQAccordion';
import InstagramFeed from '../sections/InstagramFeed';
import VideoSection from '../sections/VideoSection';
import { ProductCard } from '../cards/ProductCard';
import { useHomeData } from '../../features/home/hooks/useHomeData';
import type {
  FAQ as HomeFAQ,
  FeaturedCategory,
  FeaturedProduct as HomeFeaturedProduct,
} from '../../features/home/types/home.types';
import type { Product } from '../../features/products/types/product.types';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const collectionCards = [
  {
    title: 'Marble Tiles',
    href: '/marble-tiles-alwar',
    image: shreeDurga,
  },
  {
    title: 'Italian Marble',
    href: '/italian-marble-alwar',
    image: shreeDurga1,
  },
  {
    title: 'Granite',
    href: '/granite-alwar',
    image: kitchenGranite,
  },
  {
    title: 'Designer Tiles',
    href: '/designer-tiles-alwar',
    image: designerTiles,
  },
  {
    title: 'Bathroom Tiles',
    href: '/bathroom-tiles-alwar',
    image: bathroomTiles,
  },
  {
    title: 'Kitchen Tops',
    href: '/kitchen-tops-alwar',
    image: kitchenGranite,
  },
  {
    title: 'Mandir Marble',
    href: '/mandir-marble-alwar',
    image: shreeDurga,
  },
  {
    title: 'Outdoor Stone',
    href: '/outdoor-stone-alwar',
    image: outdoorFlooring,
  },
  {
    title: 'Tiles Shop in Naugaon',
    href: '/tiles-shop-naugaon',
    image: outdoor,
  },
];

const showroomFaqs: HomeFAQ[] = [
  {
    id: 'delivery',
    question: 'Do you deliver outside Rajasthan?',
    answer: 'Yes. Contact us with your project location and material requirement to discuss delivery options across India.',
  },
  {
    id: 'visit',
    question: 'Can I see the stone before I order?',
    answer: 'Please visit our showroom in Naugaon, Alwar, or call us. Our team can help you compare options and finishes in person.',
  },
  {
    id: 'bulk',
    question: 'Do you supply for builders and bulk projects?',
    answer: 'Yes. Contact us with your project requirements to discuss bulk supply and pricing.',
  },
  {
    id: 'materials',
    question: 'What products do you sell?',
    answer: 'We offer marble, granite, tiles, quartz, kitchen tops, outdoor flooring, wall cladding, sanitaryware and bath fittings.',
  },
  {
    id: 'quote',
    question: 'How do I get a price?',
    answer: 'Use the contact form or call us with your requirement and approximate area. We will discuss options and pricing.',
  },
];

const benefits = [
  { title: 'Quality you can trust', text: 'Thoughtful selection for spaces made to last.', Icon: ShieldCheck },
  { title: 'Pan India delivery', text: 'Careful packing and dispatch for your project.', Icon: Truck },
  { title: 'Expert guidance', text: 'Compare materials, finishes and applications with us.', Icon: Headset },
  { title: 'Bulk supply', text: 'Speak with our team about project requirements.', Icon: Layers3 },
];

const marqueeItems = [
  '॥ जय माता दी ॥',
  'Premium Marble',
  'Granite',
  'Designer Tiles',
  'Sanitaryware',
  'Bulk Supply',
  'Pan India Delivery',
  'शुभ आरंभ',
];

function LotusMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" className="h-5 w-5 shrink-0 text-gold-light" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 8c4 5 6 10 0 20-6-10-4-15 0-20zM24 28C20 20 12 18 6 20c2 8 8 12 18 8zM24 28c4-8 12-10 18-8-2 8-8 12-18 8z" />
    </svg>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  link,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  link?: { href: string; label: string };
}) {
  return (
    <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-3xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-dark">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
        {description && <p className="mt-3 max-w-2xl leading-relaxed text-brown-light">{description}</p>}
      </div>
      {link && (
        <Link href={link.href} className="inline-flex min-h-11 items-center gap-2 border-b-2 border-brown pb-1 text-sm font-bold text-brown hover:text-gold-dark">
          {link.label}<ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function ProductShowcase({
  title,
  eyebrow,
  products,
  link,
}: {
  title: string;
  eyebrow: string;
  products: Product[];
  link?: { href: string; label: string };
}) {
  if (!products.length) return null;

  return (
    <section className="section-padding">
      <div className="container">
        <SectionHeading eyebrow={eyebrow} title={title} link={link} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HomepageSections({
  featuredProducts,
  trendingProducts,
  latestProducts,
  categories,
  faqs,
  instagramPosts,
  youtubeVideos,
  hasLoadError,
  onRetry,
}: {
  featuredProducts: Product[];
  trendingProducts: Product[];
  latestProducts: Product[];
  categories: FeaturedCategory[];
  faqs: HomeFAQ[];
  instagramPosts: { id: string; image: string; caption?: string; likes?: number; url: string }[];
  youtubeVideos: { id: string; title: string; thumbnail: string; videoUrl: string }[];
  hasLoadError: boolean;
  onRetry: () => void;
}) {
  const [activeFilter, setActiveFilter] = useState('All');
  const filterOptions = ['All', 'Marble', 'Granite', 'Tiles'];
  const filteredProducts = useMemo(() => {
    if (activeFilter === 'All') return featuredProducts;
    return featuredProducts.filter((product) =>
      `${product.categoryName} ${product.material} ${product.name}`.toLowerCase().includes(activeFilter.toLowerCase()),
    );
  }, [activeFilter, featuredProducts]);

  return (
    <>
      <div className="material-marquee overflow-hidden bg-maroon py-3.5 text-sm font-semibold tracking-wide text-[#F6E7CC]" aria-hidden="true">
        <div className="material-marquee-track flex w-max items-center gap-5">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span key={`${item}-${index}`} className={`flex shrink-0 items-center gap-5 ${item.includes('जय माता') || item.includes('शुभ') ? 'font-devanagari' : ''}`}>
              {item}<LotusMark />
            </span>
          ))}
        </div>
      </div>

      {hasLoadError && (
        <div className="container pt-6">
          <div role="status" className="flex flex-col gap-3 rounded-2xl border border-stone-line bg-white p-4 text-sm text-brown sm:flex-row sm:items-center sm:justify-between">
            <p>Some live collections could not be loaded. The rest of the showroom is available.</p>
            <button type="button" onClick={onRetry} className="min-h-11 shrink-0 rounded-full border border-brown px-5 font-semibold hover:bg-brown hover:text-white">
              Retry collections
            </button>
          </div>
        </div>
      )}

      {categories.length > 0 ? (
        <div id="shop-by-stone" className="section-padding">
          <FeaturedCategories
            categories={categories}
            title="Every surface, one showroom"
            subtitle="Explore materials and finishes for every room and project."
            viewAllLink="/categories"
            viewAllLabel="Explore all collections"
            displayMode="grid"
          />
        </div>
      ) : (
        <section id="shop-by-stone" className="section-padding">
          <div className="container">
            <SectionHeading eyebrow="Shop by stone" title="Every surface, one showroom" description="Browse our current stone and tile selection." link={{ href: '/categories', label: 'Explore collections' }} />
          </div>
        </section>
      )}

      <section id="mandir-stone" className="mandir-feature relative overflow-hidden bg-[#241110] py-16 text-[#F1E6D3] md:py-24">
        <div className="toran absolute inset-x-0 top-0" aria-hidden="true" />
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div className="pt-4">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-[#E2BE86]">Mandir &amp; Pooja Room</p>
            <h2 className="max-w-xl font-cinzel text-4xl font-semibold leading-tight text-white sm:text-5xl">
              A sacred space deserves <em className="text-[#E2BE86]">pure stone.</em>
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-[#D9CDB8]">
              White marble is a timeless choice for home temples and pooja rooms. Visit our showroom to compare stones for your mandir floor, platform and walls.
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-[#F1E6D3]">
              {['Pooja room flooring', 'Mandir platform & steps', 'Wall panels & borders'].map((item) => (
                <li key={item} className="flex items-center gap-3"><Check className="h-4 w-4 text-[#E2BE86]" />{item}</li>
              ))}
            </ul>
            <Link href="/contact" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#E2BE86] px-6 font-bold text-[#241110] hover:brightness-105">
              Enquire for Mandir Stone <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 items-end gap-5 px-2 pb-3">
            

<div className="relative isolate flex h-[330px] items-end justify-center overflow-hidden rounded-t-[999px] rounded-b-[20px] border border-[#E2BE86]/70 p-5 shadow-[0_0_0_8px_#241110,0_0_0_9px_rgba(226,190,134,.4)] sm:h-[380px]">

  <Image
    src={shreeDurga}
    alt="White marble for mandir and pooja spaces, Shree Durga Tiles Alwar"
    fill
    sizes="(max-width: 640px) 100vw, 380px"
    className="z-0 object-cover"
  />

  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

  <span className="relative z-20 mb-4 font-cinzel text-xl font-semibold text-white drop-shadow-lg">
  Pure White Marble
</span>

</div>


            
<div className="relative isolate mb-14 flex h-[290px] items-end justify-center overflow-hidden rounded-t-[999px] rounded-b-[20px] border border-[#E2BE86]/70 p-5 shadow-[0_0_0_8px_#241110,0_0_0_9px_rgba(226,190,134,.4)] sm:h-[330px]">

  <Image
    src={shreeDurga1}
    alt="Warm ivory stone selection at Shree Durga Tiles, Alwar"
    fill
    sizes="(max-width: 640px) 100vw, 380px"
    className="z-0 object-cover"
  />

  <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

  <span className="relative z-20 mb-4 font-cinzel text-xl font-semibold text-white drop-shadow-lg">
    Warm Ivory Stone
  </span>

</div>

          </div>
        </div>
      </section>

    <section className="section-padding">
  <div className="container">
    <SectionHeading
      eyebrow="Popular collections"
      title="Designed around how you live"
      link={{ href: '/products', label: 'View all products' }}
    />

    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {collectionCards.map((card) => (
        <Link
          key={card.title}
          href={card.href}
          className="group relative flex min-h-[310px] items-end overflow-hidden rounded-3xl p-5 text-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <Image
            src={card.image}
            alt={`${card.title} at Shree Durga Tiles, Alwar`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 20vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />

          <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <span className="relative z-10 flex w-full items-end justify-between gap-2">
            <span className="font-cinzel text-2xl font-semibold leading-tight">
              {card.title}
            </span>

            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-light text-brown">
              <ArrowRight className="h-4 w-4" />
            </span>
          </span>
        </Link>
      ))}
    </div>
  </div>
</section>

      <section className="container pb-10">
        <div className="grid gap-8 rounded-[28px] bg-sand p-7 sm:grid-cols-2 sm:p-10 xl:grid-cols-4">
          {benefits.map(({ title, text, Icon }) => (
            <div key={title} className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brown text-gold-light"><Icon className="h-5 w-5" /></span>
              <div><h3 className="font-cinzel text-2xl font-semibold">{title}</h3><p className="mt-1 text-sm leading-relaxed text-brown-light">{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      {filteredProducts.length > 0 && <section className="section-padding">
        <div className="container">
          <SectionHeading eyebrow="Featured stones" title="From our showroom" link={{ href: '/products', label: 'Shop all products' }} />
          <div className="mb-7 flex flex-wrap gap-2" role="group" aria-label="Filter featured stones">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                type="button"
                aria-pressed={activeFilter === filter}
                onClick={() => setActiveFilter(filter)}
                className={`min-h-11 rounded-full border px-5 text-sm font-semibold transition-colors ${activeFilter === filter ? 'border-brown bg-brown text-ivory' : 'border-[#8C8473] text-brown hover:bg-sand'}`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.slice(0, 8).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>
      </section>}

      <ProductShowcase eyebrow="Featured collections" title="More to explore" products={trendingProducts} link={{ href: '/products?sort=newest', label: 'Explore products' }} />
      <ProductShowcase eyebrow="New arrivals" title="Recently added" products={latestProducts} link={{ href: '/products?sort=newest', label: 'See what is new' }} />

      <section className="section-padding">
        <div className="container grid items-center gap-12 lg:grid-cols-2">
          <div className="tx-granite relative flex min-h-[390px] items-end overflow-hidden rounded-t-[999px] rounded-b-[28px] border border-gold p-7 shadow-[0_0_0_8px_var(--stone-50),0_0_0_9px_rgba(176,141,87,.4)]">

  <Image
    src={outdoor}
    alt="Shree Durga Tiles marble and tile showroom in Naugaon, Alwar"
    className="absolute inset-0 h-full w-full object-cover object-center"
  />

</div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-dark">About Shree Durga Tiles</p>
            <h2 className="section-title">A trusted name in <em className="text-gold-dark">stone &amp; tile</em></h2>
            <p className="mt-5 leading-relaxed text-brown-light">Find marble, granite, tiles, quartz and natural stone for homes, commercial spaces and projects. Our team can help you compare finishes and choose materials suited to your space.</p>
            <ul className="mt-6 grid gap-3 text-sm">
              {['Wide material selection', 'Guidance for homes and projects', 'Showroom in Naugaon, Alwar'].map((item) => <li key={item} className="flex items-center gap-3"><Check className="h-4 w-4 text-gold-dark" />{item}</li>)}
            </ul>
            <Link href="/about" className="btn-maroon mt-7">Our story <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section className="section-padding bg-sand/60">
  <div className="container">
    <SectionHeading
      eyebrow="Our work"
      title="Stone for every kind of space"
      description="Browse materials for residential, commercial, mandir and outdoor applications."
    />

    <div className="grid items-end gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[
        {
          label: "Residential",
          image: residentialImg,
          height: "h-[340px]",
        },
        {
          label: "Commercial",
          image: commercialImg,
          height: "h-[290px]",
        },
        {
          label: "Mandir & Temple",
          image: templeImg,
          height: "h-[340px]",
        },
        {
          label: "Outdoor & Landscape",
          image: outdoorImg,
          height: "h-[290px]",
        },
      ].map((item) => (
        <Link
          key={item.label}
          href="/gallery"
          className={`group relative ${item.height} overflow-hidden rounded-3xl`}
        >
          {/* Background Image */}
          <Image
            src={item.image}
            alt={`${item.label} stone and tile spaces, Shree Durga Tiles Alwar`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Dark Overlay */}
          <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

          {/* Title */}
          <span className="absolute bottom-5 left-5 z-10 font-cinzel text-2xl font-semibold text-white">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  </div>
</section>

<section className="bg-white py-12">
  <div className="container">
    <SectionHeading
      eyebrow="Nearby service areas"
      title="Serving Naugaon, Alwar and nearby towns"
      description="Visit our showroom on Delhi–Alwar Road or contact us about delivery for your project."
    />
    <p className="leading-relaxed text-brown-light">
      We welcome customers from Alwar, Naugaon, Rajgarh, Thanagazi, Tijara, Bhiwadi and Behror. हमारे शोरूम में मार्बल, ग्रेनाइट और टाइल्स की जानकारी लें।
    </p>
  </div>
</section>

      <section className="process-section relative overflow-hidden bg-brown-dark py-16 text-white md:py-24">
        <div className="container relative z-10">
          <SectionHeading eyebrow="How it works" title="From first visit to final selection" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['01', 'Visit or call', 'Share your plan, budget and taste. Walk the showroom or talk to us.'],
              ['02', 'Choose your stone', 'Compare real stone and finishes before you decide.'],
              ['03', 'Get your quote', 'Discuss your requirement and project quantities with our team.'],
              ['04', 'Arrange delivery', 'Discuss delivery options for your location.'],
            ].map(([number, title, text]) => (
              <article key={number} className="rounded-3xl border border-white/20 bg-white/[0.04] p-6">
                <span className="font-cinzel text-5xl text-gold-light">{number}</span>
                <h3 className="mt-4 font-cinzel text-2xl font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-dark">Questions</p>
            <h2 className="section-title">Good to know before you visit</h2>
            <p className="mt-4 leading-relaxed text-brown-light">Can&apos;t find your answer? Call or message us and we&apos;ll help you choose.</p>
            <Link href="/contact" className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-brown underline decoration-gold underline-offset-4">Contact our team <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <FAQAccordion faqs={faqs.length ? faqs : showroomFaqs} title="Frequently asked questions" />
        </div>
      </section>

      <section id="quote" className="quote-band bg-sand py-16 md:py-20">
        <div className="container grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gold-dark">Get a free quote</p>
            <h2 className="max-w-2xl font-cinzel text-4xl font-semibold leading-tight">Planning a project? Let&apos;s choose the right stone.</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-brown-light">Tell us what you&apos;re building. We&apos;ll discuss options, samples and bulk pricing for your project.</p>
            <p className="mt-4 flex items-center gap-2 text-sm text-brown-light"><MapPin className="h-4 w-4 text-gold-dark" />Delhi–Alwar Road, Near Kapoor Dharamshala, Naugaon, Alwar, Rajasthan, India.</p>
          </div>
          <Link href="/contact" className="btn-maroon min-h-14 px-8">Request a quote <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      {instagramPosts.length > 0 && <InstagramFeed posts={instagramPosts} />}
      {youtubeVideos.length > 0 && <VideoSection videos={youtubeVideos} />}
      <Newsletter />
    </>
  );
}

export default function HomePage() {
  const { data, error, refetch } = useHomeData();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time: number) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => {
      lenis.destroy();
      gsap.ticker.remove(lenis.raf);
    };
  }, []);

  const homeData = data || {};
  const toDisplayProduct = (product: HomeFeaturedProduct): Product => ({
    ...product,
    id: product.id || product._id || product.slug,
    description: '',
    category: '',
    createdAt: '',
    updatedAt: '',
  });
  const displayFeaturedProducts = (homeData.featuredProducts || []).map(toDisplayProduct);
  const displayTrendingProducts = (homeData.trendingProducts || []).map(toDisplayProduct);
  const displayLatestProducts = (homeData.latestProducts || []).map(toDisplayProduct);
  const displayCategories = (homeData.categories || []).map((category) => ({
    ...category,
    id: category.id || category._id || category.slug,
  }));
  const instagramPosts = (homeData.instagramPosts || []).map((post) => ({
    id: post.id,
    image: post.imageUrl,
    caption: post.caption,
    likes: post.likes,
    url: post.link || '#',
  }));
  const youtubeVideos = (homeData.youtubeVideos || []).map((video) => ({
    id: video.id,
    title: video.title,
    thumbnail: video.thumbnailUrl || '',
    videoUrl: video.url || '',
  }));

  return (
    <>
      <Hero />
      <HomepageSections
        featuredProducts={displayFeaturedProducts}
        trendingProducts={displayTrendingProducts}
        latestProducts={displayLatestProducts}
        categories={displayCategories}
        faqs={homeData.faqs || []}
        instagramPosts={instagramPosts}
        youtubeVideos={youtubeVideos}
        hasLoadError={Boolean(error)}
        onRetry={() => { void refetch(); }}
      />
    </>
  );
}
