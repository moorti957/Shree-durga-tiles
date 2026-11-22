// frontend/src/app/blogs/[slug]/page.tsx

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format, isValid } from 'date-fns';
import { Calendar, User, ArrowLeft, Clock } from 'lucide-react';

// Components
import { Container } from '@/components/ui/Container';
import { ShareArticleButton } from '@/components/blog/ShareArticleButton';

// Services (server-side fetch)
import { blogApi, type BlogPost } from '@/services/blogApi';
import { blogDrafts } from '@/data/blogDrafts';
import { createPageMetadata } from '@/lib/seo';
import { getBreadcrumbSchema, JsonLd } from '@/lib/seo';

// ============================================================
// Generate static params (optional – for static generation)
// ============================================================
export async function generateStaticParams() {
  try {
    const posts = await blogApi.getAll(); // This would be server-side
    return [...blogDrafts, ...posts.filter((post) => !blogDrafts.some((draft) => draft.slug === post.slug))].map((post: BlogPost) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Unable to load blog posts for static parameters:', error);
    return blogDrafts.map((post) => ({ slug: post.slug }));
  }
}

// ============================================================
// Generate metadata for SEO
// ============================================================
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post = blogDrafts.find((draft) => draft.slug === slug) || null;
  if (!post) {
    try {
      post = await blogApi.getBySlug(slug);
    } catch (error) {
      console.error(`Unable to generate metadata for blog post ${slug}:`, error);
    }
  }
  if (!post) {
    return createPageMetadata({
      title: 'Article Not Found | Shree Durga Tiles',
      description: 'This article could not be found. Browse marble and tile guides from Shree Durga Tiles in Alwar.',
      path: `/blogs/${slug}`,
      noIndex: true,
    });
  }

  const title = `${post.title} | Shree Durga Tiles`.slice(0, 60);
  const description = (post.excerpt || `Read ${post.title} from Shree Durga Tiles in Alwar.`).slice(0, 155);
  return {
    ...createPageMetadata({ title, description, path: `/blogs/${slug}` }),
    openGraph: {
      title,
      description,
      url: `https://www.shreedurgatiles.site/blogs/${slug}`,
      siteName: 'Shree Durga Tiles',
      images: [{ url: post.coverImage }],
      locale: 'en_IN',
      type: 'article',
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      authors: [post.author],
    },
  };
}

// ============================================================
// Blog Detail Page (Server Component)
// ============================================================
export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post: BlogPost | null = null;
  let error = false;

  try {
    post = blogDrafts.find((draft) => draft.slug === slug) || await blogApi.getBySlug(slug);
  } catch (fetchError) {
    console.error(`Unable to load blog post ${slug}:`, fetchError);
    error = true;
  }

  // If post not found or error, trigger 404
  if (!post || error) {
    notFound();
  }

  // Format date
  const publishedDate = post.publishedAt ? new Date(post.publishedAt) : null;
  const formattedDate = publishedDate && isValid(publishedDate)
    ? format(publishedDate, 'MMMM d, yyyy')
    : null;
  const breadcrumb = getBreadcrumbSchema(`/blogs/${slug}`, post.title);

  return (
    <>
    <JsonLd data={breadcrumb} />
    <Container className="py-12 md:py-20">
      {/* Back to blogs */}
      <Link
        href="/blogs"
        className="inline-flex items-center gap-2 text-brown-light hover:text-gold-dark transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all articles</span>
      </Link>

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 text-sm text-brown-light/70 mb-4">
            <span className="bg-gold/10 text-gold-dark px-3 py-1 rounded-full text-xs font-semibold">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime} min read
            </span>
          </div>

          <h1 className="font-cinzel text-3xl md:text-4xl lg:text-5xl font-bold text-brown leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-brown-light/80">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              {post.author}
            </span>
            {formattedDate && <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </span>}
            <ShareArticleButton title={post.title} />
          </div>
        </header>

        {/* Cover Image */}
        <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-lg mb-10">
          <Image
            src={post.coverImage}
            alt={`${post.title} — marble and tile guidance, Alwar`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        </div>

        {/* Content */}
        <div
          className="prose prose-lg prose-brown max-w-none
                     prose-headings:font-cinzel prose-headings:text-brown
                     prose-a:text-gold-dark hover:prose-a:text-gold
                     prose-strong:text-brown
                     prose-blockquote:border-l-gold prose-blockquote:text-brown-light
                     prose-img:rounded-xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

      </article>

      {/* Related Posts (if available from API) */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <section className="mt-20 pt-10 border-t border-gold/10">
          <h2 className="font-cinzel text-2xl font-bold text-brown mb-8">
            Related Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {post.relatedPosts.map((related) => (
              <Link
                key={related.id}
                href={`/blogs/${related.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gold/5 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[16/9] bg-sand">
                  <Image
                    src={related.coverImage}
                    alt={related.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-cinzel text-base font-semibold text-brown group-hover:text-gold-dark transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  {related.publishedAt && isValid(new Date(related.publishedAt)) && (
                    <p className="text-xs text-brown-light/70 mt-1">
                      {format(new Date(related.publishedAt), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </Container>
    </>
  );
}