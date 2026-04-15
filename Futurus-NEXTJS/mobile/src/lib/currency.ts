/**
 * Currency Conversion Utilities
 * Backend stores prices in USD, frontend displays in Brazilan Guaraníes (₲)
 * Exchange Rate: 1 USD = 7,300 Guaraníes
 */

export const USD_TO_GUARANI_RATE = 7300;

/**
 * Convert USD price to Guaraníes
 * @param usdPrice - Price in USD
 * @returns Price in Guaraníes
 */
export function usdToGuarani(usdPrice: number): number {
  return usdPrice * USD_TO_GUARANI_RATE;
}

/**
 * Format Guaraní price with symbol and locale
 * @param guaraniPrice - Price in Guaraníes
 * @returns Formatted string (e.g., "₲386.754")
 */
export function formatGuaraniPrice(guaraniPrice: number): string {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(guaraniPrice);
}

/**
 * Convert USD price to Guaraníes and format with symbol
 * @param usdPrice - Price in USD
 * @returns Formatted Guaraní price string (e.g., "₲386.754")
 */
export function convertAndFormatPrice(usdPrice: number): string {
  const guaraniPrice = usdToGuarani(usdPrice);
  return formatGuaraniPrice(guaraniPrice);
}

/**
 * Format USD price for reference
 * @param usdPrice - Price in USD
 * @returns Formatted USD string (e.g., "$52.99")
 */
export function formatUsdPrice(usdPrice: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usdPrice);
}

/**
 * Format Guaraní price without decimals (integer display)
 * @param price - Price in Guaraníes
 * @returns Formatted string without decimals
 */
export function formatGuaraniPriceNoDecimals(price: number): string {
  return `₲${Math.round(price).toLocaleString('es-PY')}`;
}

/**
 * Calculate discount percentage
 * @param originalPrice - Original price in USD
 * @param salePrice - Sale price in USD
 * @returns Discount percentage (e.g., 20 for 20% off)
 */
export function calculateDiscountPercentage(
  originalPrice: number,
  salePrice: number,
): number {
  if (originalPrice <= 0)
    return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}
