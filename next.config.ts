import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // В проекте изображения добавляются через админку уже после сборки.
    // Поэтому отдаём их напрямую, без оптимизатора next/image, чтобы фото сотрудников
    // и загруженные иконки не превращались в 404 в production.
    unoptimized: true,
  },
};

export default nextConfig;
