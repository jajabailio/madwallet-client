import { describe, expect, it } from 'vitest';
import formatDate from '../formatDate';

describe('formatDate', () => {
  it('should format date in short US format', () => {
    const date = new Date('2025-01-05');
    const formatted = formatDate(date);
    expect(formatted).toBe('Jan 5, 2025');
  });

  it('should handle different months correctly', () => {
    expect(formatDate(new Date('2025-03-15'))).toBe('Mar 15, 2025');
    expect(formatDate(new Date('2025-12-31'))).toBe('Dec 31, 2025');
  });

  it('should handle dates from different years', () => {
    expect(formatDate(new Date('2020-06-20'))).toBe('Jun 20, 2020');
    expect(formatDate(new Date('2030-11-01'))).toBe('Nov 1, 2030');
  });

  it('should handle dates with Date objects', () => {
    const date = new Date(2025, 0, 5); // January is 0-indexed
    expect(formatDate(date)).toBe('Jan 5, 2025');
  });
});
