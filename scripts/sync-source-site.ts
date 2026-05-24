import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOURCE_SITE_URL = (process.env.SOURCE_SITE_URL || 'https://www.xn---75-2ddjth.xn--p1ai').replace(/\/$/, '');

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === 'object' ? (value as AnyRecord) : {};
}

function str(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return null;
}

function num(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value.replace(',', '.'));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function bool(value: unknown, fallback = true) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (['true', '1', 'yes', 'да'].includes(value.toLowerCase())) return true;
    if (['false', '0', 'no', 'нет'].includes(value.toLowerCase())) return false;
  }
  return fallback;
}

function date(...values: unknown[]) {
  for (const value of values) {
    const raw = str(value);
    if (!raw) continue;
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function slugify(value: string) {
  const translit: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
    к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
    х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  };

  const base = value
    .toLowerCase()
    .split('')
    .map((char) => translit[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return base || `item-${Date.now()}`;
}

function absoluteUrl(value: string | null) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/')) return `${SOURCE_SITE_URL}${value}`;
  return `${SOURCE_SITE_URL}/${value}`;
}

function normalizeItems(payload: unknown): AnyRecord[] {
  if (Array.isArray(payload)) return payload.map(asRecord);

  const record = asRecord(payload);
  const candidateKeys = ['items', 'data', 'results', 'cinemas', 'news', 'documents', 'explanations', 'rows'];

  for (const key of candidateKeys) {
    const value = record[key];
    if (Array.isArray(value)) return value.map(asRecord);
    if (value && typeof value === 'object') {
      const nested = normalizeItems(value);
      if (nested.length) return nested;
    }
  }

  return [];
}

async function fetchJson(path: string) {
  const url = `${SOURCE_SITE_URL}${path}`;
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  if (!text.trim()) return [];
  return JSON.parse(text);
}

async function loadItems(name: string, paths: string[]) {
  for (const path of paths) {
    try {
      const payload = await fetchJson(path);
      const items = normalizeItems(payload);
      console.log(`✅ ${name}: ${items.length} записей из ${path}`);
      return items;
    } catch (error) {
      console.warn(`⚠️ ${name}: не удалось прочитать ${path}:`, error instanceof Error ? error.message : error);
    }
  }

  console.warn(`⚠️ ${name}: данные не найдены`);
  return [];
}

async function syncCinemas() {
  const items = await loadItems('Кинотеатры', ['/api/cinemas', '/api/admin/cinemas']);

  for (const [index, item] of items.entries()) {
    const name = str(item.name, item.title);
    if (!name) continue;

    const data = {
      name,
      address: str(item.address, item.location) || 'Забайкальский край',
      latitude: num(item.latitude, item.lat, item.coordsLat) ?? 52.033973,
      longitude: num(item.longitude, item.lng, item.lon, item.coordsLng) ?? 113.499432,
      link: absoluteUrl(str(item.link, item.url, item.siteUrl, item.website)),
      phone: str(item.phone, item.contacts),
      description: str(item.description, item.content, item.excerpt),
      imageUrl: absoluteUrl(str(item.imageUrl, item.image, item.photoUrl, item.photo)),
      order: num(item.order, item.sortOrder) ?? index + 1,
      active: bool(item.active, true),
    };

    const existing = await prisma.cinema.findFirst({ where: { name } });
    if (existing) {
      await prisma.cinema.update({ where: { id: existing.id }, data });
    } else {
      await prisma.cinema.create({ data });
    }
  }

  console.log(`✅ Кинотеатры синхронизированы: ${items.length}`);
}

async function syncNews() {
  const items = await loadItems('Новости', ['/api/news', '/api/admin/news']);

  for (const item of items) {
    const title = str(item.title, item.name);
    if (!title) continue;

    const slug = str(item.slug) || slugify(title);
    const content = str(item.content, item.body, item.text, item.description, item.excerpt) || `<p>${title}</p>`;

    await prisma.news.upsert({
      where: { slug },
      update: {
        title,
        content,
        excerpt: str(item.excerpt, item.description),
        imageUrl: absoluteUrl(str(item.imageUrl, item.image, item.photoUrl, item.photo)),
        published: bool(item.published, true),
        publishedAt: date(item.publishedAt, item.date, item.createdAt),
      },
      create: {
        title,
        slug,
        content,
        excerpt: str(item.excerpt, item.description),
        imageUrl: absoluteUrl(str(item.imageUrl, item.image, item.photoUrl, item.photo)),
        published: bool(item.published, true),
        publishedAt: date(item.publishedAt, item.date, item.createdAt),
      },
    });
  }

  console.log(`✅ Новости синхронизированы: ${items.length}`);
}

async function syncAntiCorruption() {
  const items = await loadItems('Противодействие коррупции', ['/api/anti-corruption', '/api/admin/anti-corruption']);

  for (const item of items) {
    const title = str(item.title, item.name, item.fileName);
    if (!title) continue;

    const fileUrl = absoluteUrl(str(item.fileUrl, item.url, item.link, item.href)) || SOURCE_SITE_URL;
    const data = {
      title,
      description: str(item.description, item.excerpt, item.content),
      fileUrl,
      fileName: str(item.fileName, item.filename, item.name) || `${slugify(title)}.pdf`,
      fileSize: num(item.fileSize, item.size) ? Math.trunc(num(item.fileSize, item.size) as number) : null,
      category: str(item.category, item.type),
      publishedAt: date(item.publishedAt, item.date, item.createdAt),
    };

    const existing = await prisma.antiCorruption.findFirst({
      where: { title: data.title, fileUrl: data.fileUrl },
    });

    if (existing) {
      await prisma.antiCorruption.update({ where: { id: existing.id }, data });
    } else {
      await prisma.antiCorruption.create({ data });
    }
  }

  console.log(`✅ Документы по коррупции синхронизированы: ${items.length}`);
}

async function syncProsecutor() {
  const items = await loadItems('Прокурор разъясняет', ['/api/prosecutor', '/api/admin/prosecutor']);

  for (const item of items) {
    const title = str(item.title, item.name);
    if (!title) continue;

    const slug = str(item.slug) || slugify(title);
    const content = str(item.content, item.body, item.text, item.description, item.excerpt) || `<p>${title}</p>`;

    await prisma.prosecutorExplanation.upsert({
      where: { slug },
      update: {
        title,
        content,
        excerpt: str(item.excerpt, item.description),
        publishedAt: date(item.publishedAt, item.date, item.createdAt),
      },
      create: {
        title,
        slug,
        content,
        excerpt: str(item.excerpt, item.description),
        publishedAt: date(item.publishedAt, item.date, item.createdAt),
      },
    });
  }

  console.log(`✅ Разъяснения прокурора синхронизированы: ${items.length}`);
}

async function syncFooterSocials() {
  const footerSocials = [
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

  await prisma.homePage.upsert({
    where: { key: 'footer_socials' },
    update: { value: JSON.stringify(footerSocials) },
    create: { key: 'footer_socials', value: JSON.stringify(footerSocials) },
  });

  console.log('✅ Соцсети в подвале обновлены');
}

async function main() {
  console.log(`🔄 Источник: ${SOURCE_SITE_URL}`);

  await syncFooterSocials();
  await syncCinemas();
  await syncNews();
  await syncAntiCorruption();
  await syncProsecutor();

  console.log('🎉 Синхронизация завершена');
}

main()
  .catch((error) => {
    console.error('❌ Ошибка синхронизации:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
