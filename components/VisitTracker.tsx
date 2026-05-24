'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const VISIT_TTL_MS = 30 * 60 * 1000;

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api')
    ) {
      return;
    }

    const storageKey = `visit:${pathname}`;
    const now = Date.now();
    const lastVisit = Number(sessionStorage.getItem(storageKey) || '0');

    if (now - lastVisit < VISIT_TTL_MS) return;
    sessionStorage.setItem(storageKey, String(now));

    const payload = JSON.stringify({
      path: pathname,
      userAgent: navigator.userAgent,
      referer: document.referrer || null,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/statistics', new Blob([payload], { type: 'application/json' }));
      return;
    }

    fetch('/api/statistics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Статистика не должна ломать публичные страницы.
    });
  }, [pathname]);

  return null;
}
