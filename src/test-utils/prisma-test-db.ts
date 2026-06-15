import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const tables = ['IpAddress', 'Subnet', 'Device', 'Site'];

export async function resetTestDb() {
  await prisma.$transaction(
    tables.map((t) => prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" CASCADE`))
  );
}

export async function seedTestDb() {
  // @reason: Site/Subnet/IpAddress/Device models not yet in prisma/schema.prisma (added in later task)
  // @ts-expect-error - prisma.site not yet in generated client
  await prisma.site.create({ data: { name: 'Test Site' } });
}

export { prisma };
