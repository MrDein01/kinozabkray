import { prisma } from '@/lib/prisma';
import CinemasClient from './CinemasClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCinemas() {
  return prisma.cinema.findMany({
    where: { active: true },
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });
}

export default async function CinemasPage() {
  const cinemas = await getCinemas();

  return (
    <CinemasClient
      cinemas={cinemas.map((cinema) => ({
        id: cinema.id,
        name: cinema.name,
        address: cinema.address,
        latitude: cinema.latitude,
        longitude: cinema.longitude,
        link: cinema.link,
        phone: cinema.phone,
        description: cinema.description,
        order: cinema.order,
      }))}
    />
  );
}
