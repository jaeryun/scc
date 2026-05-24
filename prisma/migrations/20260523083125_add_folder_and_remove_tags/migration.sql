CREATE TABLE "DemoDashboardFolder" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoDashboardFolder_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "DemoDashboardFolder" ADD CONSTRAINT "DemoDashboardFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DemoDashboardFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DemoDashboard" DROP COLUMN "tags";
ALTER TABLE "DemoDashboard" ADD COLUMN "folderId" TEXT;

ALTER TABLE "DemoDashboard" ADD CONSTRAINT "DemoDashboard_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "DemoDashboardFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
