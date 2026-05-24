'use client';

import { useMemo, useState } from 'react';

interface CinemaItem {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  link: string | null;
  phone: string | null;
  description: string | null;
  order: number;
}

const markerPositions = [
  { x: 50, y: 50, cluster: 2 },
  { x: 57, y: 56 },
  { x: 67, y: 48 },
  { x: 65, y: 55, cluster: 2 },
  { x: 73, y: 45 },
  { x: 65, y: 69 },
  { x: 79, y: 72 },
  { x: 61, y: 55 },
  { x: 70, y: 52 },
];

function formatCinemaName(name: string) {
  return name === name.toUpperCase() ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : name;
}

function getMapUrl(cinema?: CinemaItem) {
  if (!cinema) return 'https://yandex.ru/maps/?text=кинотеатры%20Забайкалья';
  return `https://yandex.ru/maps/?ll=${cinema.longitude},${cinema.latitude}&z=15&text=${encodeURIComponent(cinema.name)}`;
}

export default function CinemasClient({ cinemas }: { cinemas: CinemaItem[] }) {
  const sortedCinemas = useMemo(
    () => [...cinemas].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
    [cinemas],
  );
  const [activeId, setActiveId] = useState(sortedCinemas[0]?.id || '');
  const activeCinema = sortedCinemas.find((cinema) => cinema.id === activeId) || sortedCinemas[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="px-4 pb-16 pt-16 md:pb-20 md:pt-20">
        <div className="mx-auto max-w-[1280px]">
          <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">Кинотеатры Забайкалья</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Выберите кинотеатр и перейдите на его сайт для расписания и билетов.
          </p>
        </div>
      </section>

      <section className="border-t border-black/5 bg-[#f3f3f0] px-4 py-10 md:py-16">
        <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="relative h-[600px] overflow-hidden rounded-md border border-black/15 bg-white shadow-[0_18px_45px_rgba(17,17,17,0.10)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(17,17,17,0.12)_1px,transparent_1.3px)] [background-size:12px_12px] opacity-50" />
            <div className="absolute left-3 top-20 z-10 flex flex-col items-center gap-0">
              <button className="h-[23px] w-[23px] rounded border border-black/15 bg-white text-2xl font-black leading-none shadow-sm" type="button">+</button>
              <div className="h-20 w-px bg-black/15" />
              <button className="h-[14px] w-[24px] rounded border border-black/15 bg-white text-xs leading-none shadow-sm" type="button">•••</button>
              <div className="h-[27px] w-px bg-black/15" />
              <button className="h-[23px] w-[23px] rounded border border-black/15 bg-white text-2xl font-black leading-none shadow-sm" type="button">−</button>
            </div>
            <a
              href={getMapUrl(activeCinema)}
              target="_blank"
              rel="noreferrer"
              className="absolute right-3 top-2 z-10 flex h-[25px] w-[25px] items-center justify-center rounded border border-black/15 bg-white text-lg font-black text-black/[0.55] shadow-sm"
              aria-label="Открыть карту"
            >
              ↗
            </a>

            {sortedCinemas.map((cinema, index) => {
              const position = markerPositions[index % markerPositions.length];
              const active = cinema.id === activeCinema?.id;

              return (
                <button
                  key={cinema.id}
                  type="button"
                  onClick={() => setActiveId(cinema.id)}
                  className={`absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] transition ${
                    position.cluster || active
                      ? 'h-9 w-9 border-red-400 bg-red-500 text-xs font-black text-white shadow-[0_0_0_6px_rgba(239,68,68,0.16)]'
                      : 'h-[18px] w-[18px] border-black bg-white text-[0px] hover:scale-110'
                  }`}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                  aria-label={cinema.name}
                  title={cinema.name}
                >
                  {position.cluster || (active ? index + 1 : '')}
                </button>
              );
            })}

            <div className="absolute bottom-2 left-2 z-10 flex items-end gap-2 text-[10px] text-black/70">
              <a href={getMapUrl(activeCinema)} target="_blank" rel="noreferrer" className="rounded border border-black/15 bg-white px-2 py-1 shadow-sm">
                📍 Открыть в Яндекс Картах
              </a>
              <span className="rounded border border-black/10 bg-white/90 px-1 py-0.5 underline">Создать свою карту</span>
            </div>
            <div className="absolute bottom-1 right-2 z-10 flex items-center gap-2 text-[10px] text-black/60">
              <span>© Яндекс</span>
              <span className="underline">Условия использования</span>
              <span className="text-lg font-black text-black/60">Яндекс Карты</span>
            </div>
          </div>

          <aside className="h-[600px] overflow-hidden rounded-md border border-black/15 bg-white shadow-[0_18px_45px_rgba(17,17,17,0.08)] lg:h-[600px]">
            <div className="border-b border-black/[0.12] px-5 py-5">
              <h2 className="text-2xl font-black">Площадки</h2>
              <p className="mt-1 text-sm text-muted-foreground">Выберите кинотеатр, чтобы сфокусироваться на карте.</p>
            </div>
            <div className="h-[520px] overflow-y-auto pb-4">
              {sortedCinemas.map((cinema) => (
                <div
                  key={cinema.id}
                  className={`border-b border-black/10 px-5 py-5 ${cinema.id === activeCinema?.id ? 'bg-black/[0.035]' : 'bg-white'}`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveId(cinema.id)}
                    className="block text-left text-base font-black hover:underline"
                  >
                    {formatCinemaName(cinema.name)}
                  </button>
                  {cinema.link && (
                    <a
                      href={cinema.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex min-h-[40px] items-center rounded-md bg-[#111111] px-5 py-2.5 text-sm font-black text-white shadow-[0_12px_24px_rgba(17,17,17,0.22)] transition hover:-translate-y-0.5"
                    >
                      Перейти на сайт
                    </a>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
