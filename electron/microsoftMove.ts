import type { GraphFolderKey } from "./types";

export interface MicrosoftFolderDestination {
  id: string;
  wellKnownName?: string | null;
}

const WELL_KNOWN_DESTINATIONS = new Set<GraphFolderKey>([
  "inbox",
  "sentitems",
  "drafts",
  "archive",
  "deleteditems",
]);

export function resolveMicrosoftDestinationId({
  destination,
  folders,
}: {
  destination: string;
  folders: MicrosoftFolderDestination[];
}) {
  const explicitFolder = folders.find((folder) => folder.id === destination);
  if (explicitFolder) {
    return explicitFolder.id;
  }

  const normalizedDestination = destination.trim().toLowerCase();

  if (WELL_KNOWN_DESTINATIONS.has(normalizedDestination as GraphFolderKey)) {
    return (
      folders.find(
        (folder) =>
          folder.wellKnownName?.trim().toLowerCase() === normalizedDestination,
      )?.id || normalizedDestination
    );
  }

  return destination;
}
