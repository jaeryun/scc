import { PrismaClient } from '../../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from '@/lib/logger';

/**
 * DATABASE_URL이 가리키는 DB가 없으면 생성.
 * docker-compose-test는 단일 'scc' DB만 만들므로,
 * 통합 테스트는 'scc_test', E2E는 'scc_e2e' DB를 별도로 생성해야 함.
 */
export async function ensureTestDatabase(targetDb: 'scc_test' | 'scc_e2e') {
  const baseUrl = process.env.DATABASE_URL ?? '';
  const adminUrl = baseUrl.replace(/\/[^/]+$/, '/postgres');
  const adapter = new PrismaPg({ connectionString: adminUrl });
  const admin = new PrismaClient({ adapter });
  try {
    const exists = await admin.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = '${targetDb}')`
    );
    if (!exists[0]?.exists) {
      await admin.$executeRawUnsafe(`CREATE DATABASE "${targetDb}"`);
      logger.info({ op: 'createTestDb', db: targetDb }, 'Created test database');
    }
  } finally {
    await admin.$disconnect();
  }
}
