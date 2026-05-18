-- AlterTable
ALTER TABLE "Subnet" ADD COLUMN "purpose" TEXT;
ALTER TABLE "Subnet" ADD COLUMN "centers" TEXT[] NOT NULL DEFAULT '{}';
