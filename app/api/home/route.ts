import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type HomeRecord = Record<string, unknown>;
type HomeArrayPayload = Array<{ key: string; value: unknown }>;
type HomePayload = HomeRecord | HomeArrayPayload;

const DEFAULT_SOCIALS = [
  {
    id: 'vk',
    platform: 'vk',
    label: 'ВКонтакте',
    url: 'https://vk.ru/kino_chita',
    iconUrl: '/social/vk.png',
  },
  {
    id: 'telegram',
    platform: 'telegram',
    label: 'Telegram',
    url: 'https://t.me/zabkino',
    iconUrl: '/social/telegram.png',
  },
  {
    id: 'max',
    platform: 'max',
    label: 'MAX',
    url: 'https://max.ru/id7536009537_gos',
    iconUrl: '/social/max.png',
  },
];

const DEFAULTS: Record<string, string> = {
  hero_title: 'Забайкальская государственная кинокомпания',
  hero_subtitle: 'Региональное кино, кинопоказы и культурные проекты Забайкалья',
  about_title: 'О компании',
  about_content:
    'Забайкальская государственная кинокомпания — ведущий производитель кинопродукции в регионе, работающий с 1975 года. Мы создаём фильмы, которые вдохновляют, информируют и объединяют людей.\n\nНаша миссия — развитие кинокультуры в Забайкальском крае, поддержка местных талантов и создание качественного контента для зрителей всех возрастов.',
  footer_address: '672039, г. Чита, ул. Н. Островского, 56',
  footer_phone: '+7 (3022) 26-66-71',
  footer_email: 'kinochita@mail.ru',
  footer_description: 'Искусство кино в сердце Забайкалья',
  footer_socials: JSON.stringify(DEFAULT_SOCIALS),
};

function stringifyValue(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function normalizePayload(body: HomePayload): Record<string, string> {
  const result: Record<string, string> = {};

  if (Array.isArray(body)) {
    for (const item of body) {
      if (!item || typeof item !== 'object') continue;
      const key = String(item.key || '').trim();
      if (!key || key === 'id' || key === 'updatedAt') continue;
      result[key] = stringifyValue(item.value);
    }
    return result;
  }

  for (const [key, value] of Object.entries(body)) {
    if (key === 'id' || key === 'updatedAt') continue;

    if (key === 'footer' && value && typeof value === 'object' && !Array.isArray(value)) {
      const footer = value as HomeRecord;
      if (footer.address !== undefined) result.footer_address = stringifyValue(footer.address);
      if (footer.phone !== undefined) result.footer_phone = stringifyValue(footer.phone);
      if (footer.email !== undefined) result.footer_email = stringifyValue(footer.email);
      if (footer.description !== undefined) result.footer_description = stringifyValue(footer.description);
      if (footer.socials !== undefined) result.footer_socials = stringifyValue(footer.socials);
      continue;
    }

    if (key === 'socials') {
      result.footer_socials = stringifyValue(value);
      continue;
    }

    result[key] = stringifyValue(value);
  }

  if (!result.footer_socials && (result.footer_vk || result.footer_telegram || result.footer_max)) {
    const socials = [
      result.footer_vk
        ? { id: 'vk', platform: 'vk', label: 'ВКонтакте', url: result.footer_vk, iconUrl: '/social/vk.png' }
        : null,
      result.footer_telegram
        ? { id: 'telegram', platform: 'telegram', label: 'Telegram', url: result.footer_telegram, iconUrl: '/social/telegram.png' }
        : null,
      result.footer_max
        ? { id: 'max', platform: 'max', label: 'MAX', url: result.footer_max, iconUrl: '/social/max.png' }
        : null,
    ].filter(Boolean);
    result.footer_socials = JSON.stringify(socials);
  }

  return result;
}

async function upsertSettings(settings: Record<string, string>) {
  await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      prisma.homePage.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );
}

export async function GET() {
  try {
    const rows = await prisma.homePage.findMany();
    const data: Record<string, string> = { ...DEFAULTS };

    for (const row of rows) {
      data[row.key] = row.value;
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('GET /api/home failed:', error);
    return NextResponse.json(DEFAULTS, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as HomePayload;
    const settings = normalizePayload(body);
    await upsertSettings(settings);
    return NextResponse.json({ ok: true, saved: settings });
  } catch (error) {
    console.error('PUT /api/home failed:', error);
    return NextResponse.json({ error: 'Не удалось сохранить настройки главной страницы' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}
