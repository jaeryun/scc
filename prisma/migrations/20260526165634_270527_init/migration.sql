-- CreateTable
CREATE TABLE "ViewSetting" (
    "id" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'dashboard',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewSetting_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "ViewSetting_viewId_key" ON "ViewSetting"("viewId");

-- CreateIndex
CREATE INDEX "NetBoxCache_expiresAt_idx" ON "NetBoxCache"("expiresAt");
