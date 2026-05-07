export type SenderTrustPolicy = {
  trustImages: boolean;
  alwaysConfirmLinks: boolean;
  muted: boolean;
  blocked: boolean;
  markedSafe: boolean;
};

export type SenderTrustMap = Record<string, SenderTrustPolicy>;

export const SENDER_TRUST_STORAGE_KEY = "email-client-sender-trust-policies";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function defaultSenderTrustPolicy(): SenderTrustPolicy {
  return {
    trustImages: false,
    alwaysConfirmLinks: false,
    muted: false,
    blocked: false,
    markedSafe: false,
  };
}

export function loadSenderTrustPolicies(): SenderTrustMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SENDER_TRUST_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as SenderTrustMap;
  } catch {
    return {};
  }
}

export function saveSenderTrustPolicies(policies: SenderTrustMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SENDER_TRUST_STORAGE_KEY, JSON.stringify(policies));
}

export function getSenderPolicy(
  policies: SenderTrustMap,
  email: string,
): SenderTrustPolicy {
  const key = normalizeEmail(email);
  return policies[key] || defaultSenderTrustPolicy();
}

export function updateSenderPolicy(
  policies: SenderTrustMap,
  email: string,
  update: Partial<SenderTrustPolicy>,
): SenderTrustMap {
  const key = normalizeEmail(email);
  const current = policies[key] || defaultSenderTrustPolicy();
  return {
    ...policies,
    [key]: {
      ...current,
      ...update,
    },
  };
}
