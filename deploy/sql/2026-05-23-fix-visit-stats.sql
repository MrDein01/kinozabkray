-- Быстрый фикс для существующей базы: статистика + данные подвала + материалы "Прокурор разъясняет".
-- Запуск: psql "$DATABASE_URL" -f deploy/sql/2026-05-23-fix-visit-stats.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "visit_stats" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "path" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "referer" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "visit_stats_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "visit_stats_visitedAt_idx" ON "visit_stats"("visitedAt");
CREATE INDEX IF NOT EXISTS "visit_stats_path_idx" ON "visit_stats"("path");

INSERT INTO "home_page" ("id", "key", "value", "updatedAt") VALUES
    (gen_random_uuid()::text, 'footer_address', '672039, г. Чита, ул. Н. Островского, 56', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'footer_phone', '+7 (3022) 26-66-71', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'footer_email', 'kinochita@mail.ru', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'footer_description', 'Искусство кино в сердце Забайкалья', CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'footer_socials', '[{"id":"vk","platform":"vk","label":"ВКонтакте","url":"https://vk.com/kino_chita"},{"id":"telegram","platform":"telegram","label":"Telegram","url":"https://t.me/s/zabkino"}]', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO UPDATE SET
    "value" = EXCLUDED."value",
    "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "prosecutor_explanations" ("id", "title", "slug", "content", "excerpt", "publishedAt", "createdAt", "updatedAt") VALUES
    (gen_random_uuid()::text, 'Ужесточена уголовная ответственность за ограничение конкуренции', 'competition-liability', '<p>Федеральным законом от 13.12.2024 № 467-ФЗ изменена статья 178 УК РФ. Уточнены квалифицирующие признаки для картельных соглашений, совершённых организованной группой, а также для случаев уничтожения или повреждения чужого имущества.</p><p>Крупным доходом признаётся доход свыше 80 млн рублей, особо крупным — 395 млн рублей. Также предусмотрено условие освобождения от уголовной ответственности при возврате незаконно полученного дохода.</p>', 'Изменения касаются картельных соглашений, крупного дохода и условий освобождения от ответственности.', '2025-01-13', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Договоры дарения недвижимости подлежат нотариальному удостоверению', 'real-estate-gift-notary', '<p>Федеральным законом от 13.12.2024 № 459-ФЗ внесены изменения в пункт 3 статьи 574 ГК РФ. Договор дарения недвижимого имущества между гражданами теперь должен удостоверяться нотариально.</p><p>Нотариус разъясняет сторонам смысл сделки и её последствия, проверяет реальную волю участников и снижает риски незаконного отчуждения жилья.</p>', 'Поправки направлены на снижение рисков мошенничества с недвижимостью.', '2025-01-13', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Введена уголовная ответственность за незаконное использование персональных данных', 'personal-data-criminal-liability', '<p>Федеральным законом от 30.11.2024 № 421-ФЗ в УК РФ введена статья 272.1 о незаконном использовании компьютерной информации, содержащей персональные данные.</p><p>Ответственность предусмотрена за незаконный сбор, обработку, передачу и распространение персональных данных, включая деятельность сайтов, предоставляющих доступ к незаконно полученной информации.</p>', 'Новая статья УК РФ касается незаконного сбора, передачи и распространения персональных данных.', '2024-12-11', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'Что такое квишинг и как защититься от мошенников', 'quishing-safety', '<p>Квишинг — это мошенническая схема с QR-кодами. После сканирования человек может попасть на поддельный сайт, установить вредоносное ПО или передать злоумышленникам данные аккаунтов и банковских карт.</p><p>Перед сканированием проверяйте источник QR-кода, не переходите по сомнительным ссылкам, отключайте автоматические действия после сканирования и используйте надёжные средства защиты.</p>', 'Квишинг — разновидность фишинга, где вместо обычной ссылки используется QR-код.', '2025-03-30', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO UPDATE SET
    "title" = EXCLUDED."title",
    "content" = EXCLUDED."content",
    "excerpt" = EXCLUDED."excerpt",
    "publishedAt" = EXCLUDED."publishedAt",
    "updatedAt" = CURRENT_TIMESTAMP;
