export type SupportedCurrency =
  | "INR"
  | "USD"
  | "EUR"
  | "GBP"
  | "CAD"
  | "AUD"
  | "AED"
  | "SGD"
  | "JPY"
  | "IDR"
  | "KRW"
  | "VND"
  | "PKR"
  | "BDT";

export interface CurrencyDetail {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  inrRate: number; // 1 unit of this currency in INR (e.g., 1 USD = 85 INR, 1 JPY = 0.56 INR)
}

// 1 Unit of foreign currency in INR (e.g. 1 USD = 85 INR)
export const CURRENCY_METADATA: Record<string, CurrencyDetail> = {
  INR: { code: "INR", symbol: "₹", name: "Indian Rupee", inrRate: 1.0 },
  USD: { code: "USD", symbol: "$", name: "US Dollar", inrRate: 85.0 },
  EUR: { code: "EUR", symbol: "€", name: "Euro", inrRate: 92.0 },
  GBP: { code: "GBP", symbol: "£", name: "British Pound", inrRate: 110.0 },
  CAD: { code: "CAD", symbol: "CA$", name: "Canadian Dollar", inrRate: 62.0 },
  AUD: { code: "AUD", symbol: "AU$", name: "Australian Dollar", inrRate: 55.0 },
  AED: { code: "AED", symbol: "AED ", name: "UAE Dirham", inrRate: 23.1 },
  SGD: { code: "SGD", symbol: "SG$", name: "Singapore Dollar", inrRate: 64.0 },
  // Currencies weaker than INR (1 unit < 1 INR):
  JPY: { code: "JPY", symbol: "¥", name: "Japanese Yen", inrRate: 0.56 },
  IDR: { code: "IDR", symbol: "Rp ", name: "Indonesian Rupiah", inrRate: 0.0053 },
  KRW: { code: "KRW", symbol: "₩", name: "South Korean Won", inrRate: 0.062 },
  VND: { code: "VND", symbol: "₫", name: "Vietnamese Dong", inrRate: 0.0033 },
  PKR: { code: "PKR", symbol: "PKR ", name: "Pakistani Rupee", inrRate: 0.30 },
  BDT: { code: "BDT", symbol: "Tk ", name: "Bangladeshi Taka", inrRate: 0.70 },
};

// Map country codes to local currency
export const COUNTRY_TO_CURRENCY_MAP: Record<string, SupportedCurrency> = {
  IN: "INR",
  US: "USD",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  AE: "AED",
  SG: "SGD",
  JP: "JPY",
  ID: "IDR",
  KR: "KRW",
  VN: "VND",
  PK: "PKR",
  BD: "BDT",
  // Eurozone countries
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  IE: "EUR",
  PT: "EUR",
  FI: "EUR",
};

/**
 * Checks if a currency's unit value is greater/stronger than INR
 * i.e., 1 unit of foreign currency > 1 INR
 */
export function isCurrencyStrongerThanInr(currency: string, inrRate?: number): boolean {
  if (currency === "INR") return false;
  const rate = inrRate || CURRENCY_METADATA[currency]?.inrRate || 85;
  return rate > 1.0;
}

/**
 * Core Business Logic:
 * - If target currency is GREATER/STRONGER than INR (e.g. USD, EUR, GBP):
 *     multiplier = 1.5x (apply 1.5x markup)
 * - If location currency is WEAKER than INR (e.g. JPY, IDR, VND, PKR):
 *     multiplier = 1.0x (DO NOT multiply)
 * - If INR:
 *     multiplier = 1.0x (standard domestic pricing)
 */
export function getCurrencyMultiplier(
  currency: string,
  strongerMultiplier: number = 1.5,
  inrRate?: number
): number {
  if (currency === "INR") return 1.0;
  return isCurrencyStrongerThanInr(currency, inrRate) ? strongerMultiplier : 1.0;
}

/**
 * Universal INR to Target Currency Converter
 */
export function convertFromInr(
  inrAmount: number,
  targetCurrency: string = "INR",
  strongerMultiplier: number = 1.5,
  customRate?: number
): {
  convertedAmount: number;
  isStronger: boolean;
  multiplier: number;
  rate: number;
  formatted: string;
} {
  if (!inrAmount || inrAmount <= 0) {
    return {
      convertedAmount: 0,
      isStronger: false,
      multiplier: 1.0,
      rate: 1.0,
      formatted: formatCurrency(0, targetCurrency),
    };
  }

  if (targetCurrency === "INR") {
    return {
      convertedAmount: inrAmount,
      isStronger: false,
      multiplier: 1.0,
      rate: 1.0,
      formatted: formatCurrency(inrAmount, "INR"),
    };
  }

  const meta = CURRENCY_METADATA[targetCurrency] || CURRENCY_METADATA["USD"];
  const rate = customRate && customRate > 0 ? customRate : meta.inrRate;
  const isStronger = rate > 1.0;
  const multiplier = isStronger ? (strongerMultiplier || 1.5) : 1.0;

  const rawAmount = (inrAmount / rate) * multiplier;
  // If rate < 1 (weaker currency like JPY or IDR), round to integer units
  const convertedAmount = rate < 1 ? Math.round(rawAmount) : Math.round(rawAmount * 100) / 100;

  return {
    convertedAmount,
    isStronger,
    multiplier,
    rate,
    formatted: formatCurrency(convertedAmount, targetCurrency),
  };
}

/**
 * Legacy Helper for USD conversion (maintains backwards compatibility)
 */
export function convertInrToUsd(
  inrAmount: number,
  exchangeRate: number = 85,
  multiplier: number = 1.5
): number {
  return convertFromInr(inrAmount, "USD", multiplier, exchangeRate).convertedAmount;
}

/**
 * Legacy Helper for USD to INR conversion
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
 * Format currency amount with symbol
 */
export function formatCurrency(
  amount: number,
  currency: string = "INR"
): string {
  const meta = CURRENCY_METADATA[currency] || { symbol: currency === "USD" ? "$" : "₹" };
  const symbol = meta.symbol;

  if (currency === "INR") {
    return `${symbol}${Math.round(Number(amount)).toLocaleString("en-IN")}`;
  }

  // Integer currencies (JPY, IDR, KRW, VND)
  if (["JPY", "IDR", "KRW", "VND"].includes(currency)) {
    return `${symbol}${Math.round(Number(amount)).toLocaleString("en-US")}`;
  }

  return `${symbol}${Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
