import type {
  CollectRequest,
  CollectionHandle,
  CollectStatusRequest,
  CollectResult,
  DisburseRequest,
  DisburseResult,
  PaymentProvider,
} from "../types";

/**
 * Base class for aggregator adapters that haven't been wired up to live credentials yet.
 * Each candidate (MoneyUnify, Lipila, DPO, Nsano) extends this with the same three methods
 * once a contract is signed — the rest of the app already depends only on `PaymentProvider`,
 * so filling these in is the entire integration surface.
 */
export abstract class NotImplementedProvider implements PaymentProvider {
  abstract id: string;

  async collect(_request: CollectRequest): Promise<CollectionHandle> {
    throw new Error(
      `PaymentProvider "${this.id}" is not yet implemented. Set PAYMENT_PROVIDER=mock for development, ` +
        `or implement collect() in src/lib/payments/adapters/${this.id}.ts against the aggregator's API.`,
    );
  }

  async checkCollectionStatus(_request: CollectStatusRequest): Promise<CollectResult> {
    throw new Error(`PaymentProvider "${this.id}" is not yet implemented.`);
  }

  async disburse(_request: DisburseRequest): Promise<DisburseResult> {
    throw new Error(`PaymentProvider "${this.id}" is not yet implemented.`);
  }
}
