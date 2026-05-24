export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { prisma } = await import('@/lib/prisma')
    try {
      await prisma.$connect()
      console.log('[startup] Database connected')
    } catch (err) {
      console.error('[startup] Database connection failed:', err)
      process.exit(1)
    }
  }
}
