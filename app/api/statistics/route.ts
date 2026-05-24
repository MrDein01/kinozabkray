import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MAX_DAYS = 365;

function clampDays(value: string | null): number {
  const days = Number(value || '30');
  if (!Number.isFinite(days)) return 30;
  return Math.min(Math.max(Math.trunc(days), 1), MAX_DAYS);
}

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip') || 'unknown';
}

function hashString(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return `hash_${Math.abs(hash).toString(16)}`;
}

function cleanString(value: unknown, max = 500): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function browserName(userAgent: string | null) {
  if (!userAgent) return 'Неизвестно';
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('opr/') || ua.includes('opera')) return 'Opera';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('yabrowser')) return 'Яндекс Браузер';
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('safari')) return 'Safari';
  return 'Другое';
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function topFromMap(map: Map<string, number>, limit = 10) {
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawPath = cleanString(body.path, 512);

    if (!rawPath || !rawPath.startsWith('/')) {
      return NextResponse.json({ ok: false, error: 'Некорректный путь страницы' }, { status: 400 });
    }

    if (
      rawPath.startsWith('/admin') ||
      rawPath.startsWith('/api') ||
      rawPath.startsWith('/_next')
    ) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const ip = cleanString(body.ip, 128) || hashString(getClientIp(request));

    await prisma.visitStats.create({
      data: {
        path: rawPath,
        userAgent: cleanString(body.userAgent, 500),
        referer: cleanString(body.referer, 500),
        ip,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Statistics POST error:', error);
    return NextResponse.json(
      { ok: false, error: 'Не удалось сохранить статистику' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const days = clampDays(request.nextUrl.searchParams.get('days'));
    const since = new Date();
    since.setDate(since.getDate() - days + 1);
    since.setHours(0, 0, 0, 0);

    const [total, today, rows, recent] = await Promise.all([
      prisma.visitStats.count(),
      prisma.visitStats.count({ where: { visitedAt: { gte: startOfToday() } } }),
      prisma.visitStats.findMany({
        where: { visitedAt: { gte: since } },
        select: {
          path: true,
          userAgent: true,
          referer: true,
          visitedAt: true,
        },
        orderBy: { visitedAt: 'desc' },
      }),
      prisma.visitStats.findMany({
        take: 20,
        select: {
          path: true,
          referer: true,
          visitedAt: true,
        },
        orderBy: { visitedAt: 'desc' },
      }),
    ]);

    const byPath = new Map<string, number>();
    const byDate = new Map<string, number>();
    const byBrowser = new Map<string, number>();
    const byReferer = new Map<string, number>();

    for (let i = 0; i < days; i += 1) {
      const day = new Date(since);
      day.setDate(since.getDate() + i);
      byDate.set(getDateKey(day), 0);
    }

    for (const row of rows) {
      byPath.set(row.path, (byPath.get(row.path) || 0) + 1);
      const dateKey = getDateKey(row.visitedAt);
      byDate.set(dateKey, (byDate.get(dateKey) || 0) + 1);
      byBrowser.set(browserName(row.userAgent), (byBrowser.get(browserName(row.userAgent)) || 0) + 1);
      if (row.referer) {
        let referer = row.referer;
        try {
          referer = new URL(row.referer).hostname;
        } catch {
          // Оставляем исходное значение, если это не URL.
        }
        byReferer.set(referer, (byReferer.get(referer) || 0) + 1);
      }
    }

    const daily = Array.from(byDate.entries()).map(([date, count]) => ({ date, count }));
    const topPages = topFromMap(byPath, 12).map(({ name, count }) => ({ path: name, count }));
    const browsers = topFromMap(byBrowser, 8);
    const referrers = topFromMap(byReferer, 8);

    return NextResponse.json({
      ok: true,
      days,
      total,
      today,
      periodTotal: rows.length,
      uniquePages: byPath.size,
      daily,
      topPages,
      browsers,
      referrers,
      recent: recent.map((item) => ({
        path: item.path,
        referer: item.referer,
        visitedAt: item.visitedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Statistics GET error:', error);
    return NextResponse.json(
      { ok: false, error: 'Не удалось загрузить статистику. Проверьте таблицу visit_stats.' },
      { status: 500 },
    );
  }
}
