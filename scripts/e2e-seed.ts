import { PrismaClient } from '../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ensureTestDatabase } from '../src/test-utils/create-test-db';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  await ensureTestDatabase('scc_e2e');

  console.log('Resetting scc_e2e database...');
  const tables = ['IpAddress', 'Subnet', 'Device', 'Site'];
  await prisma.$transaction(
    tables.map((t) => prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" CASCADE`))
  );

  console.log('Seeding scc_e2e database...');
  // @reason: Site/Subnet/IpAddress/Device models not yet in prisma/schema.prisma (added in later task)
  // @ts-expect-error - prisma.site not yet in generated client
  await prisma.site.create({ data: { name: 'E2E Site 1' } });

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
