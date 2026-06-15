import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.{test,integration.test}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/.next/**', 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.{test,integration.test}.{ts,tsx}',
        'src/**/index.ts',
        'src/components/ui/**',
        'src/mocks/**',
        'src/test-utils/**',
        '**/*.d.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
        perFile: false
      }
    }
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
});
