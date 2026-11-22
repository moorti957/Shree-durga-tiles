import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import marble from '@/assets/pure-white-marble.png';
import italian from '@/assets/warm-ivory-stone.png';
import granite from '@/assets/kitchen-granite.jpg';
import designerTiles from '@/assets/designer-tiles.jpg';
import bathroom from '@/assets/bathroom-tiles.jpg';
import kitchen from '@/assets/kitchen-granite.jpg';
import mandir from '@/assets/temple.jpg';
import outdoor from '@/assets/outdoor-flooring1.jpg';
import showroom from '@/assets/showroom-banner.png';

const categories = [
  { title: 'Marble Tiles', href: '/marble-tiles-alwar', image: marble },
  { title: 'Italian Marble', href: '/italian-marble-alwar', image: italian },
  { title: 'Granite', href: '/granite-alwar', image: granite },
  { title: 'PGVT & Designer Tiles', href: '/designer-tiles-alwar', image: designerTiles },
  { title: 'Bathroom Tiles', href: '/bathroom-tiles-alwar', image: bathroom },
  { title: 'Kitchen Tops & Quartz', href: '/kitchen-tops-alwar', image: kitchen },
  { title: 'Mandir Marble', href: '/mandir-marble-alwar', image: mandir },
  { title: 'Outdoor Stone', href: '/outdoor-stone-alwar', image: outdoor },
  { title: 'Tiles Shop Naugaon', href: '/tiles-shop-naugaon', image: showroom },
];

export function SeoCategoryLinks() {
  return (
    <section className="section-padding">
      <Container>
        <h2 className="section-title">Shop marble, granite and tiles in Alwar</h2>
        <p className="mt-3 max-w-2xl leading-relaxed text-brown-light">
          Compare materials and room-specific collections at Shree Durga Tiles in Naugaon.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.href} href={category.href} className="group relative flex min-h-64 items-end overflow-hidden rounded-3xl p-5 text-white">
              <Image
                src={category.image}
                alt={`${category.title} at Shree Durga Tiles, Alwar`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" aria-hidden="true" />
              <span className="relative z-10 font-cinzel text-xl font-semibold">{category.title}</span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
