import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const sections = [
  { href: '/admin/news', title: 'Новости', description: 'Управление публикациями и архивом', letter: 'N' },
  { href: '/admin/about', title: 'О нас', description: 'Текст о компании и сотрудники', letter: 'O' },
  { href: '/admin/cinemas', title: 'Кинотеатры', description: 'Площадки, адреса и контакты', letter: 'K' },
  { href: '/admin/services', title: 'Услуги', description: 'Каталог услуг и стоимость', letter: 'S' },
  { href: '/admin/anti-corruption', title: 'Противодействие коррупции', description: 'Файлы и нормативные материалы', letter: 'A' },
  { href: '/admin/prosecutor', title: 'Прокурор разъясняет', description: 'Правовые разъяснения', letter: 'P' },
  { href: '/admin/home', title: 'Главная страница', description: 'Тексты первого экрана и статистика', letter: 'H' },
  { href: '/admin/statistics', title: 'Статистика', description: 'Аналитика посещений', letter: 'D' },
];

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-black/12 bg-white px-6 py-7 text-center shadow-[0_10px_26px_rgba(17,17,17,0.04)]">
      <div className="text-5xl font-black leading-none text-black">{value}</div>
      <div className="mt-2 text-sm text-black/55">{label}</div>
    </div>
  );
}

export default async function AdminPage() {
  const [newsCount, cinemasCount, servicesCount, documentsCount] = await Promise.all([
    prisma.news.count(),
    prisma.cinema.count({ where: { active: true } }),
    prisma.service.count({ where: { active: true } }),
    prisma.antiCorruption.count(),
  ]);

  return (
    <div className="px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-8">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-6 bg-black/55" />
            <p className="text-xs font-black uppercase tracking-[0.18em] text-black/65">Рабочий стол</p>
          </div>
          <h1 className="text-5xl font-black leading-none tracking-tight text-black md:text-6xl">Панель управления</h1>
          <p className="mt-4 text-base text-black/60">Выберите раздел для редактирования контента сайта.</p>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-xl border border-black/12 bg-white p-4 shadow-[0_10px_26px_rgba(17,17,17,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(17,17,17,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111111] text-sm font-black text-white">
                  {section.letter}
                </div>
                <span className="text-lg text-black/55">→</span>
              </div>
              <h2 className="mt-5 text-[30px] font-black leading-none text-black">{section.title}</h2>
              <p className="mt-3 text-sm leading-6 text-black/60">{section.description}</p>
            </Link>
          ))}
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Новостей" value={newsCount} />
          <StatCard label="Кинотеатров" value={cinemasCount} />
          <StatCard label="Услуг" value={servicesCount} />
          <StatCard label="Документов" value={documentsCount} />
        </section>
      </div>
    </div>
  );
}
