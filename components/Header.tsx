'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useAccessibility } from '@/lib/accessibility';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Главная' },
  { href: '/about', label: 'О нас' },
  { href: '/cinemas', label: 'Кинотеатры' },
  { href: '/news', label: 'Новости' },
  { href: '/services', label: 'Услуги' },
  { href: '/anti-corruption', label: 'Противодействие коррупции' },
  { href: '/prosecutor', label: 'Прокурор разъясняет' },
];

const fontSizeOptions = [
  { value: 'normal', label: 'A', className: 'text-[10px]' },
  { value: 'large', label: 'A', className: 'text-xs' },
  { value: 'xlarge', label: 'A', className: 'text-sm' },
] as const;

export default function Header() {
  const { fontSize, setFontSize, highContrast, toggleHighContrast } = useAccessibility();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 border-b text-white transition-all duration-300 ${
        scrolled
          ? 'bg-[#111111]/95 backdrop-blur-xl border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.28)]'
          : 'bg-[#111111]/95 backdrop-blur-md border-white/10'
      }`}
    >
      <div className="h-1 bg-gradient-to-r from-white/20 via-white/75 to-white/20" />

      <nav className="container mx-auto px-4 md:px-6" aria-label="Основная навигация">
        <div className="h-24 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center flex-shrink-0"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="На главную"
          >
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-14 w-40 overflow-hidden rounded-xl bg-white p-2 shadow-[0_10px_28px_rgba(0,0,0,0.28)] sm:h-16 sm:w-48 md:w-56"
            >
              <Image
                src="/logo2.jpg"
                alt="Забайкальская государственная кинокомпания"
                fill
                sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 224px"
                className="object-contain p-2"
                priority
              />
            </motion.div>
          </Link>

          <div className="hidden xl:flex items-center justify-center flex-1">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Link
                    href={item.href}
                    className={`relative px-3 py-5 text-sm font-bold transition-colors ${
                      isActive ? 'text-white' : 'text-white/60 hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                    <span
                      className={`absolute left-3 right-3 bottom-0 h-0.5 rounded-full bg-gradient-to-r from-white to-white/40 transition-transform duration-200 ${
                        isActive ? 'scale-x-100' : 'scale-x-0'
                      }`}
                    />
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="hidden md:flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 p-1">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFontSize(option.value)}
                  className={`h-8 min-w-8 rounded-md font-black transition-colors ${option.className} ${
                    fontSize === option.value
                      ? 'bg-white text-[#111111]'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                  type="button"
                  aria-label={`Размер текста: ${option.value}`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              onClick={toggleHighContrast}
              className={`w-10 h-10 rounded-lg flex items-center justify-center hover:text-white hover:bg-white/10 ${
                highContrast ? 'bg-white text-[#111111]' : 'text-white/60'
              }`}
              type="button"
              aria-pressed={highContrast}
              aria-label="Переключить высокий контраст"
            >
              👁
            </button>

            <button
              onClick={() => setMobileMenuOpen((value) => !value)}
              className="xl:hidden w-10 h-10 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              type="button"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            >
              <span className="text-2xl leading-none">{mobileMenuOpen ? '×' : '☰'}</span>
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="xl:hidden overflow-hidden border-t border-white/10 bg-[#111111]/98"
          >
            <div className="container mx-auto px-4 md:px-6 py-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-bold transition-colors ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                    {isActive && <span className="h-2 w-2 rounded-full bg-white" />}
                  </Link>
                );
              })}

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 md:hidden">
                <span className="text-sm font-bold text-white/70">Размер текста</span>
                <div className="flex items-center gap-1">
                  {fontSizeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFontSize(option.value)}
                      className={`h-8 min-w-8 rounded-md font-black transition-colors ${option.className} ${
                        fontSize === option.value
                          ? 'bg-white text-[#111111]'
                          : 'bg-white/10 text-white/70'
                      }`}
                      type="button"
                      aria-label={`Размер текста: ${option.value}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
