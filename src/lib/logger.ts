import 'server-only';
import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const REDACT_PATHS = [
  '*.password',
  '*.token',
  '*.secret',
  'req.headers.authorization',
  'req.headers.cookie'
];

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  redact: REDACT_PATHS,
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true, ignore: 'pid,hostname' }
    }
  })
});
