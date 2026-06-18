import { PrismaClient } from '../../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
});
const prisma = new PrismaClient({ adapter });
const tables = ['IpAddress', 'Subnet', 'Device', 'Site'];

export async function resetTestDb() {
  await prisma.$transaction(
    tables.map((t) => prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" CASCADE`))
  );
}

export async function seedTestDb() {
  // @reason: Site model not yet in prisma/schema.prisma (planned for later task)
  // @ts-expect-error - prisma.site not yet in generated client
  await prisma.site.create({ data: { name: 'Test Site' } });
}

export { prisma };
