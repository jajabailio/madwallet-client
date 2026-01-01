/**
 * Formats currency amount from cents to display format
 * @param amountCents - Amount in cents (e.g., 42087 for ₱420.87)
 * @returns Formatted currency string (e.g., "₱420.87")
 */
const formatCurrency = (amountCents: number): string => {
  // Convert cents to dollars by dividing by 100
  const dollars = amountCents / 100;

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(dollars);
};

export default formatCurrency;
