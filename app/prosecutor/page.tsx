import { prisma } from '@/lib/prisma';
import ProsecutorClient from './ProsecutorClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProsecutorPage() {
  const explanations = await prisma.prosecutorExplanation.findMany({
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <ProsecutorClient
      explanations={explanations.map((explanation) => ({
        id: explanation.id,
        title: explanation.title,
        slug: explanation.slug,
        content: explanation.content,
        excerpt: explanation.excerpt,
        publishedAt: explanation.publishedAt.toISOString(),
      }))}
    />
  );
}
