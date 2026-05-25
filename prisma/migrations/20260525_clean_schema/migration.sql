warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
For more information, see: https://pris.ly/prisma-config

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "IpStatus" AS ENUM ('FREE', 'ALLOCATED', 'RESERVED', 'DISABLED');

-- CreateTable
CREATE TABLE "Subnet" (
    "id" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "description" TEXT,
    "vlanId" TEXT,
    "purpose" TEXT,
    "centers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subnet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IpAddress" (
    "id" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "status" "IpStatus" NOT NULL DEFAULT 'FREE',
    "hostname" TEXT,
    "description" TEXT,
    "subnetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IpAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ViewSetting" (
    "id" TEXT NOT NULL,
    "viewId" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'dashboard',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ViewSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subnet_network_key" ON "Subnet"("network");

-- CreateIndex
CREATE INDEX "Subnet_network_idx" ON "Subnet"("network");

-- CreateIndex
CREATE UNIQUE INDEX "IpAddress_ip_subnetId_key" ON "IpAddress"("ip", "subnetId");

-- CreateIndex
CREATE UNIQUE INDEX "ViewSetting_viewId_key" ON "ViewSetting"("viewId");

-- AddForeignKey
ALTER TABLE "IpAddress" ADD CONSTRAINT "IpAddress_subnetId_fkey" FOREIGN KEY ("subnetId") REFERENCES "Subnet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

