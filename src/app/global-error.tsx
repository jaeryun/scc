'use client';

import NextError from 'next/error';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  console.error('Global render failed', { digest: error.digest, message: error.message });

  return (
    <html lang='en'>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
