import { PrismaClient } from '@prisma/client';
import { ensureTestDatabase } from '../src/test-utils/create-test-db';

const prisma = new PrismaClient();

async function main() {
  await ensureTestDatabase('scc_test');

  console.log('Resetting scc_test database...');
  const tables = ['IpAddress', 'Subnet', 'Device', 'Site'];
  await prisma.$transaction(
    tables.map((t) => prisma.$executeRawUnsafe(`TRUNCATE TABLE "${t}" CASCADE`))
  );

  console.log('Seeding scc_test database...');
  // @reason: Site/Subnet/IpAddress/Device models not yet in prisma/schema.prisma (added in later task)
  // @ts-expect-error - prisma.site not yet in generated client
  await prisma.site.create({ data: { name: 'Test Site' } });

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
