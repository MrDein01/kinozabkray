import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function makeSlug(value: string) {
  const fallback = `news-${Date.now()}`;
  const prepared = value
    .toLowerCase()
    .trim()
    .replace(/[ё]/g, 'е')
    .replace(/[^a-zа-я0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return prepared || fallback;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === '1';

    const news = await prisma.news.findMany({
      where: all ? undefined : { published: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(news);
  } catch (error) {
    console.error('GET /api/news failed', error);
    return NextResponse.json({ error: 'Не удалось загрузить новости' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = String(body.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: 'Заголовок обязателен' }, { status: 400 });
    }

    const baseSlug = String(body.slug || makeSlug(title)).trim();
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.news.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const item = await prisma.news.create({
      data: {
        title,
        slug,
        excerpt: body.excerpt ? String(body.excerpt) : null,
        content: String(body.content || ''),
        imageUrl: body.imageUrl ? String(body.imageUrl) : null,
        published: Boolean(body.published ?? true),
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('POST /api/news failed', error);
    return NextResponse.json({ error: 'Не удалось создать новость' }, { status: 500 });
  }
}
