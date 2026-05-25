-- CreateTable
CREATE TABLE "NetBoxCache" (
    "url" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "staleUntil" TIMESTAMP(3) NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NetBoxCache_pkey" PRIMARY KEY ("url")
);

-- CreateIndex
CREATE INDEX "NetBoxCache_expiresAt_idx" ON "NetBoxCache"("expiresAt");

-- CreateIndex
CREATE INDEX "NetBoxCache_url_idx" ON "NetBoxCache"("url" text_pattern_ops);
