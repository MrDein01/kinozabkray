import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatDate(date?: Date | null) {
  if (!date) return '';
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

type NewsDetailProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export default async function NewsDetailPage({ params }: NewsDetailProps) {
  const { slug } = await Promise.resolve(params);
  const item = await prisma.news.findUnique({ where: { slug } });

  if (!item || !item.published) notFound();

  return (
    <article className="min-h-screen bg-background text-foreground">
      <section className="brand-hero px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <Link href="/news" className="text-sm font-black text-primary hover:opacity-75">
            ← Все новости
          </Link>
          <div className="section-kicker mt-8 mb-5">{formatDate(item.publishedAt)}</div>
          <h1 className="text-3xl md:text-5xl font-black leading-tight">{item.title}</h1>
          {item.excerpt && <p className="mt-5 max-w-3xl text-lg text-muted-foreground">{item.excerpt}</p>}
        </div>
      </section>

      <section className="px-4 py-10 md:py-14">
        <div className="container mx-auto max-w-5xl">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="mb-10 max-h-[760px] w-full rounded-2xl border border-border bg-white object-contain"
            />
          )}
          <div
            className="prose news-detail-content max-w-none rounded-2xl border border-border bg-card p-6 md:p-10"
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        </div>
      </section>
    </article>
  );
}
