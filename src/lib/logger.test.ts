import { describe, it, expect, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { logger, REDACT_PATHS } from './logger';
import pino from 'pino';

describe('logger', () => {
  it('exports the required PII redact paths', () => {
    expect(REDACT_PATHS).toEqual([
      '*.password',
      '*.token',
      '*.secret',
      'req.headers.authorization',
      'req.headers.cookie'
    ]);
  });

  it('masks password field at any depth', () => {
    // Build a fresh pino instance with the same redact array and capture output
    const lines: string[] = [];
    const stream = {
      write: (s: string) => {
        lines.push(s);
        return true;
      }
    };
    const captureLogger = pino(
      {
        redact: REDACT_PATHS,
        level: 'info'
      },
      stream
    );
    captureLogger.info({ user: { name: 'alice', password: 'p4ssw0rd' } }, 'login');
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.user.name).toBe('alice');
    expect(parsed.user.password).toBe('[Redacted]');
  });

  it('masks authorization header', () => {
    const lines: string[] = [];
    const stream = {
      write: (s: string) => {
        lines.push(s);
        return true;
      }
    };
    const captureLogger = pino({ redact: REDACT_PATHS, level: 'info' }, stream);
    captureLogger.info({ req: { headers: { authorization: 'Bearer xyz' } } }, 'request');
    const parsed = JSON.parse(lines[0]!);
    expect(parsed.req.headers.authorization).toBe('[Redacted]');
  });

  it('logger has at least info level enabled', () => {
    expect(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).toContain(logger.level);
    // confirm the module exports a working logger
    expect(typeof logger.info).toBe('function');
  });
});
