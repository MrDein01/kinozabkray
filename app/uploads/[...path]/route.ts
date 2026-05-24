import { readFile, stat } from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const contentTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

function isSafeSegment(segment: string) {
  return /^[a-z0-9._-]+$/i.test(segment) && segment !== '.' && segment !== '..';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (!segments?.length || segments.some((segment) => !isSafeSegment(segment))) {
    return NextResponse.json({ error: 'Некорректный путь к файлу' }, { status: 400 });
  }

  const uploadsRoot = path.resolve(process.cwd(), 'public', 'uploads');
  const filePath = path.resolve(uploadsRoot, ...segments);

  if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) {
    return NextResponse.json({ error: 'Некорректный путь к файлу' }, { status: 400 });
  }

  try {
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 404 });
    }

    const file = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[extension] || 'application/octet-stream';

    return new NextResponse(new Uint8Array(file), {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(file.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Файл не найден' }, { status: 404 });
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const response = await GET(request, { params });
  return new NextResponse(null, {
    status: response.status,
    headers: response.headers,
  });
}
