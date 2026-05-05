import type { Account } from "@/types/email";

export function resolveMailMoveOperation({
  provider,
  destinationFolderId,
}: {
  provider: Account["provider"];
  destinationFolderId: string;
}) {
  if (provider === "google") {
    const normalizedDestination = destinationFolderId.toUpperCase();

    if (
      normalizedDestination === "TRASH" ||
      normalizedDestination === "DELETEDITEMS"
    ) {
      return { provider: "google" as const, destination: "TRASH" };
    }

    if (normalizedDestination === "ARCHIVE") {
      return { provider: "google" as const, destination: "ARCHIVE" };
    }

    if (normalizedDestination === "INBOX") {
      return { provider: "google" as const, destination: "INBOX" };
    }

    if (normalizedDestination === "DRAFT" || normalizedDestination === "DRAFTS") {
      return { provider: "google" as const, destination: "DRAFT" };
    }

    if (normalizedDestination === "SPAM" || normalizedDestination === "JUNKMAIL") {
      return { provider: "google" as const, destination: "SPAM" };
    }
  }

  return {
    provider: "microsoft" as const,
    destinationFolderId,
  };
}
