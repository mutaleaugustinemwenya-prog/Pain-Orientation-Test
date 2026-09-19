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
import { describeSandboxCredentials } from "./sandbox-credentials";

/**
 * Simulates an MTN/Airtel Mobile Money aggregator so the whole app is testable without live
 * credentials. Mirrors the real-world shape (STK push → payer approves → async completion):
 * `collect()` always starts PENDING; `checkCollectionStatus()` resolves it once
 * `MOCK_COLLECTION_DELAY_MS` has elapsed, so the UI genuinely exercises a "processing" state.
 *
 * Test hooks (phone number suffix), so failure/timeout paths are exercisable without real money:
 *   - phone ending in "0000" -> collection fails ("declined by user")
 *   - phone ending in "1111" -> disbursement fails ("payout rejected by network")
 *
 * Every call logs whether MTN MoMo / Airtel Money sandbox credentials (see .env.example) are
 * configured, so the credential plumbing is visible ahead of a real integration — but the
 * credentials are never read for anything else here; collect()/disburse() stay fully synthetic.
 */
const MOCK_COLLECTION_DELAY_MS = 4000;

export class MockPaymentProvider implements PaymentProvider {
  id = "mock";

  async collect(request: CollectRequest): Promise<CollectionHandle> {
    console.info(`[mock-payments] collect via ${request.network}: ${describeSandboxCredentials(request.network)}`);
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
    console.info(`[mock-payments] disburse via ${request.network}: ${describeSandboxCredentials(request.network)}`);
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
