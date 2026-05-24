'use client';

import { useMemo, useState } from 'react';

interface AntiCorruptionDocument {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  category: string;
  publishedAt: string;
}

const categoryOrder = [
  'Все',
  'Памятки',
  'Нормативные документы',
  'Указы президента Российской Федерации',
  'Приказы министерства юстиции',
  'Постановления правительства Российской Федерации',
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function formatFileSize(size: number | null) {
  if (!size) return 'PDF';
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} КБ`;
  return `${(size / 1024 / 1024).toFixed(1)} МБ`;
}

export default function AntiCorruptionClient({ documents }: { documents: AntiCorruptionDocument[] }) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');

  const categories = useMemo(() => {
    const fromData = Array.from(new Set(documents.map((document) => document.category).filter(Boolean)));
    const ordered = categoryOrder.filter((category) => category === 'Все' || fromData.includes(category));
    const rest = fromData.filter((category) => !ordered.includes(category));
    return [...ordered, ...rest];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    const preparedQuery = query.trim().toLowerCase();

    return documents.filter((document) => {
      const matchCategory = activeCategory === 'Все' || document.category === activeCategory;
      const matchQuery = !preparedQuery || `${document.title} ${document.description || ''}`.toLowerCase().includes(preparedQuery);
      return matchCategory && matchQuery;
    });
  }, [activeCategory, documents, query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="px-4 pb-10 pt-16 md:pt-20">
        <div className="mx-auto max-w-[960px] rounded-md border border-black/20 bg-white/[0.9] p-7 shadow-[0_18px_45px_rgba(17,17,17,0.05)] md:p-9">
          <h1 className="text-3xl font-black leading-tight md:text-4xl">Информация о противодействии коррупции</h1>
          <p className="mt-6 text-base leading-8 text-muted-foreground">
            Если Вы считаете, что Вам стали известны факты коррупции, а также если у Вас имеются конкретные предложения, направленные на совершенствование работы по противодействию коррупции, Вы можете направить обращение в установленном порядке.
          </p>
          <p className="mt-4 text-base leading-8 text-muted-foreground">
            На этой странице размещены памятки, нормативно-правовые акты, рекомендации и документы, регулирующие вопросы противодействия коррупции.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20 pt-2 md:pb-24">
        <div className="mx-auto max-w-[1180px]">
          <label className="relative block">
            <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-black/[0.45]">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-[48px] w-full rounded-md border border-black/15 bg-white px-12 text-base outline-none shadow-[0_10px_22px_rgba(17,17,17,0.03)] placeholder:text-black/[0.45] focus:border-black/[0.35]"
              placeholder="Поиск документов..."
            />
          </label>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-md border px-5 py-2.5 text-sm font-black shadow-[0_8px_18px_rgba(17,17,17,0.04)] ${
                  activeCategory === category
                    ? 'border-[#111111] bg-[#111111] text-white'
                    : 'border-black/[0.18] bg-[#eeeeec] text-black hover:bg-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {filteredDocuments.map((document) => (
              <article
                key={document.id}
                className="flex flex-col gap-5 rounded-md border border-black/[0.14] bg-white/90 p-6 shadow-[0_14px_34px_rgba(17,17,17,0.05)] md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-black">
                    <span className="rounded bg-black/[0.08] px-3 py-1">{document.category}</span>
                    <span className="text-black/[0.55]">{formatDate(document.publishedAt)}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-black leading-snug">{document.title}</h2>
                  {document.description && (
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{document.description}</p>
                  )}
                </div>
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-3 rounded-md bg-[#222222] px-6 py-3 text-base font-black text-white shadow-[0_12px_24px_rgba(17,17,17,0.22)] hover:-translate-y-0.5"
                >
                  <span aria-hidden="true">↓</span>
                  Скачать
                  <span className="text-xs text-white/[0.78]">{formatFileSize(document.fileSize)}</span>
                </a>
              </article>
            ))}

            {!filteredDocuments.length && (
              <div className="rounded-md border border-black/[0.14] bg-white p-8 text-sm text-muted-foreground">
                Документы не найдены.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
