CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
