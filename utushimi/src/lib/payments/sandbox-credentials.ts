import type { MobileMoneyNetwork } from "./types";

/**
 * Credential shape for MTN MoMo / Airtel Money developer sandboxes. Nothing in this file makes
 * a network call — it exists so the mock provider can report whether sandbox credentials are
 * configured, ahead of a real integration (a direct MTN/Airtel adapter, or one of the aggregator
 * adapters in src/lib/payments/adapters/) that will actually use them.
 */
export interface MtnMomoSandboxCredentials {
  subscriptionKey: string;
  apiUser: string;
  apiKey: string;
  targetEnvironment: string;
}

export interface AirtelSandboxCredentials {
  clientId: string;
  clientSecret: string;
}

export function getMtnMomoSandboxCredentials(): MtnMomoSandboxCredentials | null {
  const subscriptionKey = process.env.MTN_MOMO_SANDBOX_SUBSCRIPTION_KEY;
  const apiUser = process.env.MTN_MOMO_SANDBOX_API_USER;
  const apiKey = process.env.MTN_MOMO_SANDBOX_API_KEY;
  if (!subscriptionKey || !apiUser || !apiKey) return null;
  return {
    subscriptionKey,
    apiUser,
    apiKey,
    targetEnvironment: process.env.MTN_MOMO_SANDBOX_TARGET_ENVIRONMENT || "sandbox",
  };
}

export function getAirtelSandboxCredentials(): AirtelSandboxCredentials | null {
  const clientId = process.env.AIRTEL_SANDBOX_CLIENT_ID;
  const clientSecret = process.env.AIRTEL_SANDBOX_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

/** One-line status for a given network — never includes the secret values themselves. */
export function describeSandboxCredentials(network: MobileMoneyNetwork): string {
  if (network === "MTN") {
    const creds = getMtnMomoSandboxCredentials();
    return creds
      ? `MTN MoMo sandbox credentials configured (target: ${creds.targetEnvironment})`
      : "MTN MoMo sandbox credentials not set — MTN_MOMO_SANDBOX_* env vars are empty";
  }
  const creds = getAirtelSandboxCredentials();
  return creds
    ? "Airtel Money sandbox credentials configured"
    : "Airtel Money sandbox credentials not set — AIRTEL_SANDBOX_* env vars are empty";
}
