import { describe, expect, it } from 'vitest';
import formatCurrency from '../formatCurrency';

describe('formatCurrency', () => {
  it('should convert cents to PHP currency format', () => {
    expect(formatCurrency(42087)).toBe('₱420.87');
  });

  it('should handle zero amount', () => {
    expect(formatCurrency(0)).toBe('₱0.00');
  });

  it('should handle negative amounts', () => {
    expect(formatCurrency(-15000)).toBe('-₱150.00');
  });

  it('should handle large amounts', () => {
    expect(formatCurrency(1000000)).toBe('₱10,000.00');
  });

  it('should handle single digit cents', () => {
    expect(formatCurrency(105)).toBe('₱1.05');
  });

  it('should handle amounts less than 1 peso', () => {
    expect(formatCurrency(50)).toBe('₱0.50');
    expect(formatCurrency(99)).toBe('₱0.99');
  });

  it('should handle very large amounts with proper thousand separators', () => {
    expect(formatCurrency(123456789)).toBe('₱1,234,567.89');
  });

  it('should handle decimal precision correctly', () => {
    // 420.87 pesos = 42087 cents
    expect(formatCurrency(42087)).toBe('₱420.87');
    // 1.50 pesos = 150 cents
    expect(formatCurrency(150)).toBe('₱1.50');
    // 999.99 pesos = 99999 cents
    expect(formatCurrency(99999)).toBe('₱999.99');
  });

  it('should not introduce floating point errors', () => {
    // Common floating point issues
    expect(formatCurrency(123)).toBe('₱1.23');
    expect(formatCurrency(456)).toBe('₱4.56');
    expect(formatCurrency(789)).toBe('₱7.89');
  });
});
