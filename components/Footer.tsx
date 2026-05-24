'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import useSWR from 'swr';

type SocialPlatform =
  | 'vk'
  | 'telegram'
  | 'max'
  | 'youtube'
  | 'rutube'
  | 'ok'
  | 'dzen'
  | 'site';

interface FooterSocial {
  id: string;
  platform?: SocialPlatform;
  label: string;
  url: string;
  iconUrl?: string;
}

interface FooterProps {
  footerData?: {
    address: string;
    phone: string;
    email: string;
    description: string;
    socials?: FooterSocial[];
  };
}

interface HomeFooterData {
  footer_address?: string;
  footer_phone?: string;
  footer_email?: string;
  footer_description?: string;
  footer_socials?: string | FooterSocial[];
  footer_vk?: string;
  footer_telegram?: string;
  footer_max?: string;
  socials?: FooterSocial[];
  footer?: {
    address?: string;
    phone?: string;
    email?: string;
    description?: string;
    socials?: FooterSocial[];
  };
}

const navLinks = [
  { href: '/', label: 'Главная' },
  { href: '/about', label: 'О нас' },
  { href: '/cinemas', label: 'Кинотеатры' },
  { href: '/news', label: 'Новости' },
  { href: '/services', label: 'Услуги' },
];

const infoLinks = [
  { href: '/anti-corruption', label: 'Противодействие коррупции' },
  { href: '/prosecutor', label: 'Прокурор разъясняет' },
  { href: '/admin', label: 'Вход в систему' },
];

const defaultSocials: FooterSocial[] = [
  {
    id: 'vk',
    platform: 'vk',
    label: 'ВКонтакте',
    url: 'https://vk.ru/kino_chita',
    iconUrl: '/social/vk.png',
  },
  {
    id: 'telegram',
    platform: 'telegram',
    label: 'Telegram',
    url: 'https://t.me/zabkino',
    iconUrl: '/social/telegram.png',
  },
  {
    id: 'max',
    platform: 'max',
    label: 'MAX',
    url: 'https://max.ru/id7536009537_gos',
    iconUrl: '/social/max.png',
  },
];

const defaultFooter = {
  address: '672039, г. Чита, ул. Н. Островского, 56',
  phone: '+7 (3022) 26-66-71',
  email: 'kinochita@mail.ru',
  description: 'Искусство кино в сердце Забайкалья',
  socials: defaultSocials,
};

const platformIcons: Record<SocialPlatform, string> = {
  vk: '/social/vk.png',
  telegram: '/social/telegram.png',
  max: '/social/max.png',
  youtube: '/social/youtube.png',
  rutube: '/social/rutube.png',
  ok: '/social/ok.png',
  dzen: '/social/dzen.png',
  site: '/social/site.png',
};

const fetcher = async (url: string) => {
  const response = await fetch(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Не удалось загрузить настройки подвала');
  return response.json();
};

function normalizePlatform(value: unknown): SocialPlatform | undefined {
  if (typeof value !== 'string') return undefined;
  return Object.keys(platformIcons).includes(value) ? (value as SocialPlatform) : undefined;
}

function normalizeSocials(value?: string | FooterSocial[] | null): FooterSocial[] {
  if (!value) return [];

  let parsed: unknown = value;

  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(parsed)) return [];

  const result: FooterSocial[] = [];

  parsed.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;

    const social = item as Partial<FooterSocial>;
    const url = String(social.url || '').trim();
    if (!url) return;

    const platform = normalizePlatform(social.platform);

    result.push({
      id: String(social.id || platform || `social-${index}`),
      platform,
      label: String(social.label || platform || 'Соцсеть'),
      url,
      iconUrl: social.iconUrl || (platform ? platformIcons[platform] : undefined),
    });
  });

  return result;
}

function socialsFromSeparateFields(homeData?: HomeFooterData): FooterSocial[] {
  const socials: FooterSocial[] = [];

  if (homeData?.footer_vk) {
    socials.push({ id: 'vk', platform: 'vk', label: 'ВКонтакте', url: homeData.footer_vk, iconUrl: platformIcons.vk });
  }

  if (homeData?.footer_telegram) {
    socials.push({ id: 'telegram', platform: 'telegram', label: 'Telegram', url: homeData.footer_telegram, iconUrl: platformIcons.telegram });
  }

  if (homeData?.footer_max) {
    socials.push({ id: 'max', platform: 'max', label: 'MAX', url: homeData.footer_max, iconUrl: platformIcons.max });
  }

  return socials;
}

export default function Footer({ footerData }: FooterProps) {
  const { data: homeData } = useSWR<HomeFooterData>('/api/home?footer=1', fetcher, {
    revalidateOnFocus: true,
    revalidateOnMount: true,
    dedupingInterval: 0,
  });

  const contacts = {
    address:
      footerData?.address ||
      homeData?.footer?.address ||
      homeData?.footer_address ||
      defaultFooter.address,
    phone:
      footerData?.phone ||
      homeData?.footer?.phone ||
      homeData?.footer_phone ||
      defaultFooter.phone,
    email:
      footerData?.email ||
      homeData?.footer?.email ||
      homeData?.footer_email ||
      defaultFooter.email,
    description:
      footerData?.description ||
      homeData?.footer?.description ||
      homeData?.footer_description ||
      defaultFooter.description,
  };

  const savedSocials = [
    ...normalizeSocials(homeData?.footer_socials),
    ...normalizeSocials(homeData?.socials),
    ...normalizeSocials(homeData?.footer?.socials),
    ...socialsFromSeparateFields(homeData),
  ];

  const uniqueSocials = savedSocials.filter(
    (social, index, array) => array.findIndex((item) => item.url === social.url) === index,
  );

  const socials = footerData?.socials?.length
    ? footerData.socials
    : uniqueSocials.length
      ? uniqueSocials
      : defaultFooter.socials;

  return (
    <footer className="relative overflow-hidden bg-[#111111] text-white border-t border-white/10">
      <div className="h-1 bg-gradient-to-r from-white/20 via-white/75 to-white/20" />

      <div className="container mx-auto px-4 md:px-6 py-14 md:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="flex items-center">
              <img src="/logo2.jpg" alt="Логотип" className="h-24 w-auto rounded-2xl object-contain shadow-[0_10px_30px_rgba(0,0,0,0.22)]" />
            </Link>

            <p className="mt-6 text-sm text-white/70">{contacts.description}</p>

            {socials.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                {socials.map((social) => (
                  <a
                    key={`${social.id}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="w-10 h-10 rounded-lg border border-white/10 bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                  >
                    {social.iconUrl ? (
                      <img src={social.iconUrl} alt="" className="w-6 h-6 object-contain" />
                    ) : (
                      <span className="text-[10px] font-black uppercase text-white/80">
                        {social.label.slice(0, 2)}
                      </span>
                    )}
                  </a>
                ))}
              </div>
            )}
          </motion.div>

          <FooterColumn title="Навигация" links={navLinks} delay={0.08} />
          <FooterColumn title="Информация" links={infoLinks} delay={0.16} />

          <motion.div
            className="md:col-span-4"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-sm font-black uppercase mb-5">Контакты</h3>

            <ul className="space-y-4 text-sm text-white/70">
              <li>{contacts.address}</li>
              <li>
                <a href={`tel:${contacts.phone.replace(/[^+\d]/g, '')}`} className="hover:text-white">
                  {contacts.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${contacts.email}`} className="hover:text-white">
                  {contacts.email}
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 text-xs text-white/50">
          © {new Date().getFullYear()} Забайкальская государственная кинокомпания
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  delay,
}: {
  title: string;
  links: { href: string; label: string }[];
  delay: number;
}) {
  return (
    <motion.div
      className="md:col-span-2"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <h3 className="text-sm font-black uppercase mb-5">{title}</h3>
      <ul className="space-y-3">
        {links.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="text-sm text-white/60 hover:text-white">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
