'use client';

import Image from 'next/image';
import useSWR from 'swr';

interface AboutData {
  about_title?: string;
  about_content?: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  photoUrl?: string | null;
}

const defaultAbout = {
  about_title: 'О компании',
  about_content:
    'Забайкальская государственная кинокомпания — ведущий производитель кинопродукции в регионе, работающий с 1975 года. Мы создаём фильмы, которые вдохновляют, информируют и объединяют людей.\n\nНаша миссия — развитие кинокультуры в Забайкальском крае, поддержка местных талантов и создание качественного контента для зрителей всех возрастов.',
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Ошибка загрузки данных');
  return response.json();
};

export default function AboutPage() {
  const { data: aboutData } = useSWR<AboutData>('/api/home', fetcher, {
    fallbackData: defaultAbout,
    revalidateOnFocus: false,
  });

  const { data: employeesData, isLoading } = useSWR<Employee[]>('/api/employees?active=true', fetcher, {
    revalidateOnFocus: false,
  });

  const title = aboutData?.about_title || defaultAbout.about_title;
  const content = aboutData?.about_content || defaultAbout.about_content;
  const employees = Array.isArray(employeesData) ? employeesData : [];

  const paragraphs = content
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-[#f5f5f2] text-black">
      <section className="border-b border-black/10 bg-white/50 px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-black/60" />
            <p className="text-xs font-black uppercase tracking-[0.18em] text-black/65">О компании</p>
          </div>
          <h1 className="max-w-5xl text-5xl font-black leading-none tracking-tight md:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-black/58">
            Информация о Забайкальской государственной кинокомпании и сотрудниках.
          </p>
        </div>
      </section>

      <section className="px-4 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-[1240px] gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
          <article className="rounded-2xl border border-black/12 bg-white p-6 shadow-[0_18px_45px_rgba(17,17,17,0.06)] md:p-10">
            <h2 className="text-3xl font-black leading-tight md:text-4xl">{title}</h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-black/65 md:text-lg">
              {paragraphs.map((paragraph, index) => (
                <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </article>

          <aside className="rounded-2xl border border-black/12 bg-white p-6 shadow-[0_18px_45px_rgba(17,17,17,0.06)] md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-lg font-black text-white">К</span>
              <div>
                <h2 className="text-2xl font-black">Команда</h2>
                <p className="text-sm text-black/50">Сотрудники кинокомпании</p>
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-xl border border-black/10 bg-black/[0.03] p-5 text-sm text-black/55">
                Загрузка сотрудников...
              </div>
            ) : employees.length > 0 ? (
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex gap-4 rounded-xl border border-black/10 bg-white p-4">
                    <div className="relative flex h-20 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/5 text-lg font-black text-black/35">
                      {employee.photoUrl ? (
                        <Image
                          src={employee.photoUrl}
                          alt={employee.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        getInitials(employee.name)
                      )}
                    </div>
                    <div className="min-w-0 pt-1">
                      <h3 className="text-lg font-black leading-6">{employee.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-black/55">{employee.position}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-black/10 bg-black/[0.03] p-5 text-sm leading-6 text-black/55">
                Сотрудники пока не добавлены.
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
