import { describe, it, expect } from 'vitest';
import { formatBytes } from './utils';

describe('formatBytes', () => {
  it('0 bytes는 "0 Byte"로 포맷', () => {
    expect(formatBytes(0)).toBe('0 Byte');
  });

  it('1024는 "1 KB"로 포맷 (default)', () => {
    expect(formatBytes(1024)).toBe('1 KB');
  });

  it('1024 * 1024는 "1 MB"로 포맷', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB');
  });

  it('sizeType: "accurate"는 KiB/MiB 사용', () => {
    expect(formatBytes(1024, { sizeType: 'accurate' })).toBe('1 KiB');
  });

  it('decimals 지정 시 소수점 자리수 적용', () => {
    expect(formatBytes(1500, { decimals: 2 })).toBe('1.46 KB');
  });
});
