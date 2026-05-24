CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO "home_page" ("id", "key", "value", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'footer_socials',
  '[{"id":"vk","platform":"vk","label":"ВКонтакте","url":"https://vk.ru/kino_chita","iconUrl":"/social/vk.png"},{"id":"telegram","platform":"telegram","label":"Telegram","url":"https://t.me/zabkino","iconUrl":"/social/telegram.png"},{"id":"max","platform":"max","label":"MAX","url":"https://max.ru/id7536009537_gos","iconUrl":"/social/max.png"}]',
  CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO UPDATE
SET "value" = EXCLUDED."value",
    "updatedAt" = CURRENT_TIMESTAMP;
