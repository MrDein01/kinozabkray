'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { SessionProvider, signOut } from 'next-auth/react';

export default function AdminChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const isDashboard = pathname === '/admin';
  const isNewsPage = pathname === '/admin/news';

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push('/admin');
  };

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/admin/login' });
    } catch {
      router.push('/admin/login');
    }
  };

  if (isLoginPage || isNewsPage) {
    return (
      <SessionProvider refetchOnWindowFocus={false}>
        {children}
      </SessionProvider>
    );
  }

  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <div className="min-h-screen bg-[#f5f5f2] text-black">
        <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f5f5f2]/95 backdrop-blur">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 md:px-8">
            <div className="flex min-w-0 items-center gap-4">
              <Link href="/admin" className="flex items-center gap-4">
                <img
                  src="/logo2.jpg"
                  alt="Логотип"
                  className="h-16 w-16 rounded-2xl object-cover shadow-[0_10px_24px_rgba(17,17,17,0.14)]"
                />
                <div className="min-w-0">
                  <div className="truncate text-xl font-black leading-none">Админ-панель</div>
                  <div className="mt-1 truncate text-sm text-black/55">Забайкальская кинокомпания</div>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              {!isDashboard && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex h-11 items-center rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-black transition hover:bg-black/5"
                >
                  ← Назад
                </button>
              )}
              <span className="hidden text-sm text-black/45 md:block">Администратор</span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 items-center rounded-xl border border-black/10 bg-white px-4 text-sm font-black text-black transition hover:bg-black/5"
              >
                Выйти
              </button>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </SessionProvider>
  );
}
