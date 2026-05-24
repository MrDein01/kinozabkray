import { prisma } from '@/lib/prisma';
import AntiCorruptionClient from './AntiCorruptionClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AntiCorruptionPage() {
  const documents = await prisma.antiCorruption.findMany({
    orderBy: [{ category: 'asc' }, { publishedAt: 'desc' }, { title: 'asc' }],
  });

  return (
    <AntiCorruptionClient
      documents={documents.map((document) => ({
        id: document.id,
        title: document.title,
        description: document.description,
        fileUrl: document.fileUrl,
        fileName: document.fileName,
        fileSize: document.fileSize,
        category: document.category || 'Документы',
        publishedAt: document.publishedAt.toISOString(),
      }))}
    />
  );
}
