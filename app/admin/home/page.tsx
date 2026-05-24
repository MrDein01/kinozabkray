'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type SocialItem = {
  id: string;
  platform: 'vk' | 'telegram' | 'max';
  label: string;
  url: string;
  iconUrl: string;
};

type HomeSettings = {
  hero_title?: string;
  hero_subtitle?: string;
  footer_address?: string;
  footer_phone?: string;
  footer_email?: string;
  footer_description?: string;
  footer_socials?: string;
};

const defaultSocials: SocialItem[] = [
  { id: 'vk', platform: 'vk', label: 'ВКонтакте', url: 'https://vk.ru/kino_chita', iconUrl: '/social/vk.png' },
  { id: 'telegram', platform: 'telegram', label: 'Telegram', url: 'https://t.me/zabkino', iconUrl: '/social/telegram.png' },
  { id: 'max', platform: 'max', label: 'MAX', url: 'https://max.ru/id7536009537_gos', iconUrl: '/social/max.png' },
];

function parseSocials(value?: string): SocialItem[] {
  if (!value) return defaultSocials;

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return defaultSocials;

    const socials = defaultSocials.map((defaultItem) => {
      const saved = parsed.find((item) => item?.platform === defaultItem.platform || item?.id === defaultItem.id);
      return {
        ...defaultItem,
        url: typeof saved?.url === 'string' && saved.url.trim() ? saved.url : defaultItem.url,
        label: typeof saved?.label === 'string' && saved.label.trim() ? saved.label : defaultItem.label,
        iconUrl: typeof saved?.iconUrl === 'string' && saved.iconUrl.trim() ? saved.iconUrl : defaultItem.iconUrl,
      };
    });

    return socials;
  } catch {
    return defaultSocials;
  }
}

export default function AdminHomePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [settings, setSettings] = useState<HomeSettings>({});
  const [socials, setSocials] = useState<SocialItem[]>(defaultSocials);

  useEffect(() => {
    let mounted = true;

    fetch('/api/home', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data: HomeSettings) => {
        if (!mounted) return;
        setSettings(data);
        setSocials(parseSocials(data.footer_socials));
      })
      .catch(() => {
        if (!mounted) return;
        setMessage('Не удалось загрузить настройки. Можно заполнить форму и сохранить заново.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const socialsPreview = useMemo(() => socials.filter((social) => social.url.trim()), [socials]);

  const updateField = (key: keyof HomeSettings, value: string) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const updateSocial = (platform: SocialItem['platform'], value: string) => {
    setSocials((current) => current.map((item) => (item.platform === platform ? { ...item, url: value } : item)));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const payload = {
      ...settings,
      footer_socials: JSON.stringify(socials.filter((social) => social.url.trim())),
    };

    try {
      const response = await fetch('/api/home', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('save failed');

      setMessage('Настройки сохранены. Подвал обновится на публичной части сайта.');
    } catch {
      setMessage('Не удалось сохранить настройки. Проверьте подключение к базе и попробуйте ещё раз.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-wide text-muted-foreground">Админ-панель</p>
          <h1 className="mt-2 text-3xl font-black">Главная и подвал сайта</h1>
          <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
            Здесь редактируются данные, которые выводятся на главной странице и в подвале. Соцсети сохраняются списком, поэтому VK, Telegram и MAX не заменяют друг друга.
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-border bg-card p-8">Загрузка настроек...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-black">Главный экран</h2>
              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-bold">
                  Заголовок
                  <input
                    value={settings.hero_title || ''}
                    onChange={(event) => updateField('hero_title', event.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
                    placeholder="Забайкальская государственная кинокомпания"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Подзаголовок
                  <textarea
                    value={settings.hero_subtitle || ''}
                    onChange={(event) => updateField('hero_subtitle', event.target.value)}
                    className="min-h-24 rounded-xl border border-border bg-background px-4 py-3 font-normal"
                    placeholder="Региональное кино, кинопоказы и культурные проекты Забайкалья"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-black">Подвал</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold md:col-span-2">
                  Описание
                  <textarea
                    value={settings.footer_description || ''}
                    onChange={(event) => updateField('footer_description', event.target.value)}
                    className="min-h-24 rounded-xl border border-border bg-background px-4 py-3 font-normal"
                    placeholder="Искусство кино в сердце Забайкалья"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold md:col-span-2">
                  Адрес
                  <input
                    value={settings.footer_address || ''}
                    onChange={(event) => updateField('footer_address', event.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
                    placeholder="672039, г. Чита, ул. Н. Островского, 56"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Телефон
                  <input
                    value={settings.footer_phone || ''}
                    onChange={(event) => updateField('footer_phone', event.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
                    placeholder="+7 (3022) 26-66-71"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Email
                  <input
                    value={settings.footer_email || ''}
                    onChange={(event) => updateField('footer_email', event.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
                    placeholder="kinochita@mail.ru"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-black">Социальные сети в подвале</h2>
              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-bold">
                  VK
                  <input
                    value={socials.find((item) => item.platform === 'vk')?.url || ''}
                    onChange={(event) => updateSocial('vk', event.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Telegram
                  <input
                    value={socials.find((item) => item.platform === 'telegram')?.url || ''}
                    onChange={(event) => updateSocial('telegram', event.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  MAX
                  <input
                    value={socials.find((item) => item.platform === 'max')?.url || ''}
                    onChange={(event) => updateSocial('max', event.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 font-normal"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {socialsPreview.map((social) => (
                  <span key={social.id} className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm">
                    <img src={social.iconUrl} alt="" className="h-5 w-5 object-contain" />
                    {social.label}
                  </span>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground disabled:opacity-60"
              >
                {saving ? 'Сохраняю...' : 'Сохранить изменения'}
              </button>
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
