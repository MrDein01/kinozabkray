'use client';

import { useMemo, useState } from 'react';

interface ProsecutorExplanation {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  publishedAt: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function ScaleIcon() {
  return (
    <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18" />
      <path d="M5 6h14" />
      <path d="M6 6l-3 7h6L6 6Z" />
      <path d="M18 6l-3 7h6l-3-7Z" />
      <path d="M8 21h8" />
    </svg>
  );
}

export default function ProsecutorClient({ explanations }: { explanations: ProsecutorExplanation[] }) {
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(explanations[0]?.id || '');

  const filtered = useMemo(() => {
    const preparedQuery = query.trim().toLowerCase();
    if (!preparedQuery) return explanations;

    return explanations.filter((item) => `${item.title} ${item.excerpt || ''} ${stripHtml(item.content)}`.toLowerCase().includes(preparedQuery));
  }, [explanations, query]);

  const active = filtered.find((item) => item.id === activeId) || filtered[0] || explanations[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="px-4 pb-14 pt-16 md:pb-16 md:pt-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="section-kicker mb-6">Правовые разъяснения</div>
          <div className="flex h-[52px] w-[52px] items-center justify-center rounded-md border border-black/[0.12] bg-white shadow-[0_14px_30px_rgba(17,17,17,0.08)]">
            <ScaleIcon />
          </div>
          <h1 className="mt-7 text-5xl font-black leading-none tracking-tight md:text-7xl">Прокурор разъясняет</h1>
          <p className="mt-6 max-w-[540px] text-base leading-8 text-muted-foreground">
            Понятные материалы по актуальным вопросам законодательства, профилактике нарушений и защите прав граждан.
          </p>
        </div>
      </section>

      <section className="border-t border-black/5 bg-[#f3f3f0] px-4 py-12 md:py-20">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-5 lg:grid-cols-[470px_minmax(0,1fr)]">
          <aside className="overflow-hidden rounded-md border border-black/15 bg-white shadow-[0_18px_45px_rgba(17,17,17,0.07)]">
            <div className="border-b border-black/10 px-6 py-5">
              <h2 className="text-2xl font-black">Разъяснения</h2>
            </div>
            <div className="border-b border-black/10 px-6 py-5">
              <label className="relative block">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/[0.40]">⌕</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-[38px] w-full rounded-md border border-black/[0.12] bg-white px-10 text-sm outline-none placeholder:text-black/[0.42] focus:border-black/[0.35]"
                  placeholder="Поиск разъяснений..."
                />
              </label>
            </div>
            <div className="max-h-[620px] overflow-y-auto">
              {filtered.map((item) => {
                const selected = item.id === active?.id;
                const preview = item.excerpt || stripHtml(item.content);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={`block w-full border-b border-black/10 px-6 py-5 text-left transition ${
                      selected ? 'border-l-[4px] border-l-[#111111] bg-[#eeeeeb]' : 'border-l-[4px] border-l-transparent bg-white hover:bg-black/[0.03]'
                    }`}
                  >
                    <h3 className="line-clamp-2 text-base font-black leading-5">{item.title}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-5 text-black/60">{preview}</p>
                    <p className="mt-3 text-xs text-black/60">{formatDate(item.publishedAt)}</p>
                  </button>
                );
              })}

              {!filtered.length && <div className="p-6 text-sm text-muted-foreground">Разъяснения не найдены.</div>}
            </div>
          </aside>

          <article className="min-h-[620px] rounded-md border border-black/15 bg-white/[0.94] shadow-[0_18px_45px_rgba(17,17,17,0.07)]">
            {active ? (
              <>
                <div className="border-b border-black/10 px-6 py-7 md:px-8 md:py-8">
                  <h2 className="max-w-[760px] text-3xl font-black leading-[1.08] md:text-5xl">{active.title}</h2>
                  <div className="mt-5 text-sm text-black/60">{formatDate(active.publishedAt)}</div>
                </div>
                <div
                  className="prose max-w-none px-6 py-8 text-base leading-8 md:px-8 [&_li]:mb-2 [&_p]:mb-4 [&_p]:text-black/70 [&_ul]:my-4 [&_ol]:my-4"
                  dangerouslySetInnerHTML={{ __html: active.content }}
                />
              </>
            ) : (
              <div className="p-8 text-sm text-muted-foreground">Выберите разъяснение.</div>
            )}
          </article>
        </div>
      </section>
    </div>
  );
}
