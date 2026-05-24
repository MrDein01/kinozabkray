import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function formatDate(date?: Date | null) {
  if (!date) return '';
  return new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export default async function NewsPage() {
  const news = await prisma.news.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="brand-hero px-4 py-16 md:py-24">
        <div className="container mx-auto max-w-7xl">
          <div className="section-kicker mb-5">Новости</div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight">Новости кинокомпании</h1>
          <p className="mt-5 max-w-3xl text-lg text-muted-foreground">
            Публикации, объявления, мероприятия и новости Забайкальской государственной кинокомпании.
          </p>
        </div>
      </section>

      <section className="px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {news.map((item) => (
              <article key={item.id} className="cinema-card overflow-hidden p-0">
                {item.imageUrl && (
                  <Link href={`/news/${item.slug}`} className="block aspect-[16/10] overflow-hidden bg-secondary">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                  </Link>
                )}
                <div className="p-6">
                  <div className="mb-3 text-xs font-black uppercase text-muted-foreground">
                    {formatDate(item.publishedAt)} · Новости
                  </div>
                  <h2 className="text-xl font-black leading-tight">
                    <Link href={`/news/${item.slug}`} className="hover:text-primary">
                      {item.title}
                    </Link>
                  </h2>
                  {item.excerpt && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.excerpt}</p>}
                  <div className="mt-6">
                    <Link href={`/news/${item.slug}`} className="text-sm font-black text-primary hover:opacity-75">
                      Читать полностью →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
