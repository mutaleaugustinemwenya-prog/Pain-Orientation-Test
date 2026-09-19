import { randomUUID } from "crypto";
import type {
  CollectRequest,
  CollectionHandle,
  CollectStatusRequest,
  CollectResult,
  DisburseRequest,
  DisburseResult,
  PaymentProvider,
} from "./types";

/**
 * Simulates an MTN/Airtel Mobile Money aggregator so the whole app is testable without live
 * credentials. Mirrors the real-world shape (STK push → payer approves → async completion):
 * `collect()` always starts PENDING; `checkCollectionStatus()` resolves it once
 * `MOCK_COLLECTION_DELAY_MS` has elapsed, so the UI genuinely exercises a "processing" state.
 *
 * Test hooks (phone number suffix), so failure/timeout paths are exercisable without real money:
 *   - phone ending in "0000" -> collection fails ("declined by user")
 *   - phone ending in "1111" -> disbursement fails ("payout rejected by network")
 */
const MOCK_COLLECTION_DELAY_MS = 4000;

export class MockPaymentProvider implements PaymentProvider {
  id = "mock";

  async collect(_request: CollectRequest): Promise<CollectionHandle> {
    return {
      providerRef: `MOCK-COL-${randomUUID()}`,
      status: "PENDING",
      initiatedAt: new Date(),
    };
  }

  async checkCollectionStatus(request: CollectStatusRequest): Promise<CollectResult> {
    const elapsedMs = Date.now() - request.initiatedAt.getTime();
    if (elapsedMs < MOCK_COLLECTION_DELAY_MS) {
      return { status: "PENDING" };
    }
    if (request.phone.endsWith("0000")) {
      return { status: "FAILED", failureReason: "Declined by user on their phone." };
    }
    return { status: "COMPLETED" };
  }

  async disburse(request: DisburseRequest): Promise<DisburseResult> {
    if (request.phone.endsWith("1111")) {
      return {
        status: "FAILED",
        providerRef: `MOCK-DIS-${randomUUID()}`,
        failureReason: "Payout rejected by network.",
      };
    }
    return { status: "PAID", providerRef: `MOCK-DIS-${randomUUID()}` };
  }
}
