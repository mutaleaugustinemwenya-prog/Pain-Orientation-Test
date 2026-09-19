import type { PaymentProvider } from "./types";
import { MockPaymentProvider } from "./mock-provider";
import { MoneyUnifyProvider } from "./adapters/moneyunify";
import { LipilaProvider } from "./adapters/lipila";
import { DpoProvider } from "./adapters/dpo";
import { NsanoProvider } from "./adapters/nsano";

export type * from "./types";

let cached: PaymentProvider | undefined;

/**
 * Selects the active PaymentProvider from `PAYMENT_PROVIDER`. Business logic (purchase flow,
 * payout batches) should only ever import `getPaymentProvider()` — never a concrete adapter —
 * so switching aggregators later is a one-line env change, not a code change.
 */
export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;

  const providerId = process.env.PAYMENT_PROVIDER ?? "mock";
  switch (providerId) {
    case "mock":
      cached = new MockPaymentProvider();
      break;
    case "moneyunify":
      cached = new MoneyUnifyProvider();
      break;
    case "lipila":
      cached = new LipilaProvider();
      break;
    case "dpo":
      cached = new DpoProvider();
      break;
    case "nsano":
      cached = new NsanoProvider();
      break;
    default:
      throw new Error(`Unknown PAYMENT_PROVIDER: "${providerId}"`);
  }
  return cached;
}
