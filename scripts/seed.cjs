const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function upsertHomePage(key, value) {
  if (!prisma.homePage) return;

  await prisma.homePage.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@kino75.ru' },
    update: {
      password: hashedPassword,
      name: 'Администратор',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@kino75.ru',
      password: hashedPassword,
      name: 'Администратор',
      role: 'ADMIN',
    },
  });

  await upsertHomePage('hero_title', 'Забайкальская государственная кинокомпания');
  await upsertHomePage('hero_subtitle', 'Региональное кино, кинопоказы и культурные проекты Забайкалья');
  await upsertHomePage('about_title', 'О компании');
  await upsertHomePage('about_content', 'Забайкальская государственная кинокомпания — региональное учреждение, связанное с кинопоказами, культурными проектами и развитием кино в Забайкальском крае.');
  await upsertHomePage('footer_address', 'г. Чита, ул. Ленина, 1');
  await upsertHomePage('footer_phone', '+7 (3022) 00-00-00');
  await upsertHomePage('footer_email', 'info@kino75.ru');
  await upsertHomePage('footer_description', 'Искусство кино в сердце Забайкалья');

  console.log('OK: admin@kino75.ru / admin123');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
