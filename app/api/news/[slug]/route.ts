import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = { params: Promise<{ slug: string }> | { slug: string } };

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await Promise.resolve(context.params);
    const item = await prisma.news.findUnique({ where: { slug } });

    if (!item) {
      return NextResponse.json({ error: 'Новость не найдена' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('GET /api/news/[slug] failed', error);
    return NextResponse.json({ error: 'Не удалось загрузить новость' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await Promise.resolve(context.params);
    const body = await request.json();
    const title = String(body.title || '').trim();

    if (!title) {
      return NextResponse.json({ error: 'Заголовок обязателен' }, { status: 400 });
    }

    const item = await prisma.news.update({
      where: { slug },
      data: {
        title,
        excerpt: body.excerpt ? String(body.excerpt) : null,
        content: String(body.content || ''),
        imageUrl: body.imageUrl ? String(body.imageUrl) : null,
        published: Boolean(body.published ?? true),
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : null,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('PUT /api/news/[slug] failed', error);
    return NextResponse.json({ error: 'Не удалось обновить новость' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { slug } = await Promise.resolve(context.params);
    await prisma.news.delete({ where: { slug } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('DELETE /api/news/[slug] failed', error);
    return NextResponse.json({ error: 'Не удалось удалить новость' }, { status: 500 });
  }
}
