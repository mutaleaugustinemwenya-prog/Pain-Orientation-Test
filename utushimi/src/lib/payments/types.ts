export type MobileMoneyNetwork = "MTN" | "AIRTEL";

export interface CollectRequest {
  /** Amount to collect, in ngwee (1/100 of a Kwacha). */
  amountNgwee: number;
  network: MobileMoneyNetwork;
  /** Phone number the collection prompt (STK push) is sent to. */
  phone: string;
  /** Our internal id (Purchase.id / AnthologyPurchase.id) — passed through for reconciliation. */
  reference: string;
  /** Human-readable line shown to the payer on their phone, e.g. the story title. */
  narrative: string;
}

/**
 * Real mobile money collections are asynchronous: the aggregator sends an STK push to the
 * payer's phone and the payer must approve it with their PIN before funds move. `collect()`
 * therefore only *starts* the collection — callers must poll `checkCollectionStatus()` (or,
 * for a real provider, receive a webhook) to learn the final outcome.
 */
export interface CollectionHandle {
  providerRef: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  failureReason?: string;
  initiatedAt: Date;
}

export interface CollectStatusRequest {
  providerRef: string;
  initiatedAt: Date;
  phone: string;
}

export interface CollectResult {
  status: "PENDING" | "COMPLETED" | "FAILED";
  failureReason?: string;
}

export interface DisburseRequest {
  /** Amount to pay out, in ngwee. */
  amountNgwee: number;
  network: MobileMoneyNetwork;
  phone: string;
  /** Our internal Payout.id — passed through for reconciliation. */
  reference: string;
  narrative: string;
}

export interface DisburseResult {
  status: "PAID" | "PROCESSING" | "FAILED";
  providerRef: string;
  failureReason?: string;
}

/**
 * Pluggable mobile-money aggregator interface. Business logic (purchase flow, payout batches)
 * only ever talks to this interface, never to a specific aggregator SDK — swapping providers
 * later (MoneyUnify, Lipila, DPO, Nsano, ...) means writing a new adapter here, nothing else.
 */
export interface PaymentProvider {
  id: string;
  /** Starts a collection (reader paying for a story/anthology). Returns immediately with PENDING. */
  collect(request: CollectRequest): Promise<CollectionHandle>;
  /** Polls the current state of a previously-started collection. */
  checkCollectionStatus(request: CollectStatusRequest): Promise<CollectResult>;
  /** Pays a writer their accumulated ledger balance. */
  disburse(request: DisburseRequest): Promise<DisburseResult>;
}
