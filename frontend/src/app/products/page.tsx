import { Suspense } from 'react';
import Container from '../../components/ui/Container';
import ProductListingClient from './ProductListingClient';

export default function ProductsPage() {
  return (
    <>
      <div className="bg-ivory">
        <Container className="pb-0 pt-8 md:pt-12">
          <h1 className="font-cinzel text-3xl font-bold text-brown md:text-4xl">
            Marble, Granite &amp; Tiles in Alwar
          </h1>
        </Container>
      </div>
      <Suspense
        fallback={
          <div
            role="status"
            aria-live="polite"
            className="min-h-[40vh] bg-ivory px-6 py-12 text-center text-brown-light"
          >
            Loading available marble, granite and tile collections…
          </div>
        }
      >
        <ProductListingClient />
      </Suspense>
    </>
  );
}
