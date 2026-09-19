/** All money in this app is stored as an integer in ngwee (1 Kwacha = 100 ngwee). */

export function kwachaToNgwee(kwacha: number): number {
  return Math.round(kwacha * 100);
}

export function ngweeToKwacha(ngwee: number): number {
  return ngwee / 100;
}

export function formatNgweeAsKwacha(ngwee: number): string {
  return new Intl.NumberFormat("en-ZM", {
    style: "currency",
    currency: "ZMW",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: ngwee % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(ngweeToKwacha(ngwee));
}

/** Platform's share of gross sale price, as a decimal (0.30 = platform keeps 30%). */
export function getPlatformRevenueShare(): number {
  const raw = Number(process.env.PLATFORM_REVENUE_SHARE ?? "0.30");
  if (Number.isNaN(raw) || raw < 0 || raw > 1) {
    throw new Error(`Invalid PLATFORM_REVENUE_SHARE: "${process.env.PLATFORM_REVENUE_SHARE}"`);
  }
  return raw;
}

/** Splits a gross story sale into the platform's cut and the writer's cut, in ngwee. */
export function splitSaleNgwee(amountNgwee: number): { platformCutNgwee: number; writerCutNgwee: number } {
  const platformCutNgwee = Math.round(amountNgwee * getPlatformRevenueShare());
  return { platformCutNgwee, writerCutNgwee: amountNgwee - platformCutNgwee };
}

export function getMinPayoutThresholdNgwee(): number {
  return Number(process.env.MIN_PAYOUT_THRESHOLD_NGWEE ?? "5000000");
}

export function getPayoutHoldbackDays(): number {
  return Number(process.env.PAYOUT_HOLDBACK_DAYS ?? "7");
}
