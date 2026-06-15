import { PrismaClient } from '@prisma/client';

/**
 * DATABASE_URL이 가리키는 DB가 없으면 생성.
 * docker-compose-test는 단일 'scc' DB만 만들므로,
 * 통합 테스트는 'scc_test', E2E는 'scc_e2e' DB를 별도로 생성해야 함.
 */
export async function ensureTestDatabase(targetDb: 'scc_test' | 'scc_e2e') {
  const baseUrl = process.env.DATABASE_URL ?? '';
  // postgres DB로 일단 접속
  const adminUrl = baseUrl.replace(/\/[^/]+$/, '/postgres');
  const admin = new PrismaClient({ datasources: { db: { url: adminUrl } } });
  try {
    const exists = await admin.$queryRawUnsafe<Array<{ exists: boolean }>>(
      `SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = '${targetDb}')`
    );
    if (!exists[0]?.exists) {
      await admin.$executeRawUnsafe(`CREATE DATABASE "${targetDb}"`);
      console.log(`Created database: ${targetDb}`);
    }
  } finally {
    await admin.$disconnect();
  }
}
