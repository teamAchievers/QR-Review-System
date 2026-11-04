export type SupportedCurrency = "INR" | "USD";

export interface CurrencyConfig {
  baseCurrency: SupportedCurrency;
  exchangeRateInrPerUsd: number; // e.g. 85 (1 USD = 85 INR)
  usdMarkupMultiplier: number; // 1.5x (as requested: converting INR to USD multiplies value by 1.5)
}

export const DEFAULT_CURRENCY_CONFIG: CurrencyConfig = {
  baseCurrency: "INR",
  exchangeRateInrPerUsd: 85,
  usdMarkupMultiplier: 1.5,
};

/**
 * Converts INR to USD with the 1.5x multiplier:
 * Formula: (amountInr / exchangeRateInrPerUsd) * usdMarkupMultiplier
 * e.g., ₹999 -> (999 / 85) * 1.5 = $17.63
 */
export function convertInrToUsd(
  inrAmount: number,
  exchangeRate: number = 85,
  multiplier: number = 1.5
): number {
  if (!inrAmount || inrAmount <= 0) return 0;
  const rate = exchangeRate > 0 ? exchangeRate : 85;
  const mult = multiplier > 0 ? multiplier : 1.5;
  const rawUsd = (inrAmount / rate) * mult;
  return Math.round(rawUsd * 100) / 100;
}

/**
 * Converts USD to INR:
 * Formula: (amountUsd / usdMarkupMultiplier) * exchangeRateInrPerUsd
 * e.g., $17.63 -> (17.63 / 1.5) * 85 = ~₹999
 */
export function convertUsdToInr(
  usdAmount: number,
  exchangeRate: number = 85,
  multiplier: number = 1.5
): number {
  if (!usdAmount || usdAmount <= 0) return 0;
  const rate = exchangeRate > 0 ? exchangeRate : 85;
  const mult = multiplier > 0 ? multiplier : 1.5;
  const rawInr = (usdAmount / mult) * rate;
  return Math.round(rawInr);
}

/**
 * Universal Currency Converter
 */
export function convertCurrency(
  amount: number,
  from: SupportedCurrency,
  to: SupportedCurrency,
  exchangeRate: number = 85,
  multiplier: number = 1.5
): number {
  if (from === to) return amount;
  if (from === "INR" && to === "USD") {
    return convertInrToUsd(amount, exchangeRate, multiplier);
  }
  if (from === "USD" && to === "INR") {
    return convertUsdToInr(amount, exchangeRate, multiplier);
  }
  return amount;
}

/**
 * Formats a currency amount with symbol (₹ for INR, $ for USD)
 */
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = "INR"
): string {
  const symbol = currency === "USD" ? "$" : "₹";
  const formatted =
    currency === "USD"
      ? Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : Math.round(Number(amount)).toLocaleString("en-IN");
  return `${symbol}${formatted}`;
}
