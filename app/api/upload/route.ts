import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// На Vercel нельзя надежно сохранять пользовательские файлы в public/uploads.
// Поэтому для бесплатного Vercel-варианта небольшие изображения сохраняются
// как data URL, а получившаяся строка записывается в imageUrl/photoUrl в базе Neon.
const MAX_FILE_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function getExtension(mimeType: string) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  return '';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Поддерживаются JPG, PNG, WEBP и GIF' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Файл слишком большой. Максимум 4 МБ' }, { status: 400 });
    }

    const extension = getExtension(file.type);
    if (!extension) {
      return NextResponse.json({ error: 'Не удалось определить тип изображения' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // В разных местах админки исторически ожидались разные поля:
    // новости брали data.url, а сотрудники брали data.fileUrl.
    // Возвращаем оба поля, чтобы загрузка работала в обоих разделах.
    return NextResponse.json({
      ok: true,
      url: dataUrl,
      fileUrl: dataUrl,
      fileName: file.name || `image.${extension}`,
      size: file.size,
      storage: 'database-data-url',
    });
  } catch (error) {
    console.error('POST /api/upload failed', error);
    return NextResponse.json({ error: 'Не удалось загрузить файл' }, { status: 500 });
  }
}
