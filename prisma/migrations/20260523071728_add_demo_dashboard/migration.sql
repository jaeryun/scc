-- CreateTable
CREATE TABLE "DemoDashboard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "layout" JSONB NOT NULL DEFAULT '{"columns":12,"rowHeight":80}',
    "panels" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoDashboard_pkey" PRIMARY KEY ("id")
);
