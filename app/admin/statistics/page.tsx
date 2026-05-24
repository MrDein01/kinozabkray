'use client';

import { useEffect, useMemo, useState } from 'react';

interface StatisticsResponse {
  ok: boolean;
  error?: string;
  days: number;
  total: number;
  today: number;
  periodTotal: number;
  uniquePages: number;
  daily: { date: string; count: number }[];
  topPages: { path: string; count: number }[];
  browsers: { name: string; count: number }[];
  referrers: { name: string; count: number }[];
  recent: { path: string; referer: string | null; visitedAt: string }[];
}

const ranges = [7, 30, 90, 365];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="text-sm text-black/[0.55]">{label}</div>
      <div className="mt-2 text-3xl font-black text-black">{value}</div>
    </div>
  );
}

function SimpleBars({ data }: { data: { label: string; count: number }[] }) {
  const max = useMemo(() => Math.max(...data.map((item) => item.count), 1), [data]);

  if (!data.length) {
    return <p className="text-sm text-black/[0.55]">Данных пока нет.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-black/70">{item.label}</span>
            <span className="font-bold text-black">{item.count}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/10">
            <div className="h-full rounded-full bg-black" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminStatisticsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<StatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/statistics?days=${days}`, { cache: 'no-store' });
        const json = (await response.json()) as StatisticsResponse;

        if (!response.ok || !json.ok) {
          throw new Error(json.error || 'Не удалось загрузить статистику');
        }

        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [days]);

  return (
    <div className="min-h-screen bg-[#f5f5f2] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-black/50">Админ-панель</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black text-black">Статистика сайта</h1>
            <p className="mt-3 max-w-2xl text-black/60">
              Посещения публичных страниц. Админка, API и служебные файлы не учитываются.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {ranges.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDays(range)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  days === range
                    ? 'bg-black text-white'
                    : 'border border-black/10 bg-white text-black hover:bg-black/5'
                }`}
              >
                {range} дн.
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-black/10 bg-white p-8 text-black/60 shadow-sm">
            Загрузка статистики...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
            <div className="mt-3 text-sm text-red-600">
              Обычно это значит, что таблица visit_stats ещё не создана. Запустите pnpm db:push или SQL из deploy/sql.
            </div>
          </div>
        )}

        {data && !loading && !error && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <StatCard label="Всего посещений" value={data.total} />
              <StatCard label="Сегодня" value={data.today} />
              <StatCard label={`За ${data.days} дней`} value={data.periodTotal} />
              <StatCard label="Уникальных страниц" value={data.uniquePages} />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-black text-black">Топ страниц</h2>
                <SimpleBars data={data.topPages.map((item) => ({ label: item.path, count: item.count }))} />
              </section>

              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-black text-black">Посещения по дням</h2>
                <SimpleBars data={data.daily.map((item) => ({ label: item.date, count: item.count }))} />
              </section>

              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-black text-black">Браузеры</h2>
                <SimpleBars data={data.browsers.map((item) => ({ label: item.name, count: item.count }))} />
              </section>

              <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-black text-black">Источники переходов</h2>
                <SimpleBars data={data.referrers.map((item) => ({ label: item.name, count: item.count }))} />
              </section>
            </div>

            <section className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
              <div className="border-b border-black/10 p-6">
                <h2 className="text-xl font-black text-black">Последние посещения</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-black/5 text-black/60">
                    <tr>
                      <th className="px-6 py-3 font-bold">Дата</th>
                      <th className="px-6 py-3 font-bold">Страница</th>
                      <th className="px-6 py-3 font-bold">Источник</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((item, index) => (
                      <tr key={`${item.visitedAt}-${item.path}-${index}`} className="border-t border-black/5">
                        <td className="px-6 py-3 text-black/65">{formatDate(item.visitedAt)}</td>
                        <td className="px-6 py-3 font-bold text-black">{item.path}</td>
                        <td className="px-6 py-3 text-black/65">{item.referer || 'Прямой заход'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
