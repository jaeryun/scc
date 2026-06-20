'use client';

import NextError from 'next/error';
import { logger } from '@/lib/logger.client';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  // Sync log: global-error replaces the root layout and may render during SSR
  // where useEffect never fires. A synchronous call catches both SSR and client errors.
  logger.error({ err: error, digest: error.digest }, 'Global render failed');

  return (
    <html lang='en'>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
