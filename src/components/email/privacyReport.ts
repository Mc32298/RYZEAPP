import type { EmailThread } from "@/types/email";

const SUSPICIOUS_SHORTENERS = new Set([
  "bit.ly",
  "tinyurl.com",
  "t.co",
  "rb.gy",
  "ow.ly",
]);

function isIpHost(hostname: string) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
}

export function derivePrivacyReport({
  emails,
  blockRemoteImages,
  trustedSenderEmails,
}: {
  emails: EmailThread[];
  blockRemoteImages: boolean;
  trustedSenderEmails: string[];
}) {
  let remoteImagesBlocked = 0;
  let blockedTrackers = 0;
  let suspiciousLinks = 0;
  let unsafeContentRemoved = 0;

  for (const email of emails) {
    const body = email.body || "";
    const lower = body.toLowerCase();

    const remoteImageMatches = lower.match(/<img[^>]+src=["']https?:\/\//g) || [];
    remoteImagesBlocked += blockRemoteImages ? remoteImageMatches.length : 0;

    const trackerMatches =
      lower.match(/<img[^>]+(?:width=["']?1["']?|height=["']?1["']?|pixel|track)/g) || [];
    blockedTrackers += trackerMatches.length;

    const unsafeMatches =
      lower.match(/<script|<iframe|<object|<embed|javascript:|on[a-z]+=/g) || [];
    if (unsafeMatches.length > 0) {
      unsafeContentRemoved += 1;
    }

    const hrefMatches = body.match(/href=["']([^"']+)["']/gi) || [];
    for (const raw of hrefMatches) {
      const href = raw.replace(/^href=["']|["']$/gi, "").trim();
      try {
        const url = new URL(href, "https://local.ryze");
        if (url.protocol === "http:") suspiciousLinks += 1;
        if (url.hostname.includes("xn--")) suspiciousLinks += 1;
        if (isIpHost(url.hostname)) suspiciousLinks += 1;
        if (SUSPICIOUS_SHORTENERS.has(url.hostname.toLowerCase())) suspiciousLinks += 1;
      } catch {
        suspiciousLinks += 1;
      }
    }
  }

  return {
    blockedTrackers,
    remoteImagesBlocked,
    suspiciousLinks,
    trustedSenders: trustedSenderEmails.length,
    unsafeContentRemoved,
  };
}
