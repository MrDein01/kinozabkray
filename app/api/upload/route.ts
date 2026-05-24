import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif']);

function getSafeExtension(fileName: string, mimeType: string) {
  const byName = fileName.split('.').pop()?.toLowerCase() || '';
  if (ALLOWED_EXTENSIONS.has(byName)) return byName;

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
    const folder = String(formData.get('folder') || 'uploads')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 40) || 'uploads';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Можно загружать только изображения' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Файл слишком большой. Максимум 10 МБ' }, { status: 400 });
    }

    const extension = getSafeExtension(file.name, file.type);
    if (!extension) {
      return NextResponse.json({ error: 'Поддерживаются JPG, PNG, WEBP и GIF' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
    await mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      ok: true,
      url: `/uploads/${folder}/${fileName}`,
      fileName,
      size: file.size,
    });
  } catch (error) {
    console.error('POST /api/upload failed', error);
    return NextResponse.json({ error: 'Не удалось загрузить файл' }, { status: 500 });
  }
}
