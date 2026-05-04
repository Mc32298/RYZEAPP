export interface DraggedEmailData {
  emailId: string;
  messageId: string;
  folderId: string;
  subject?: string;
}

export interface FolderDropPayload extends DraggedEmailData {
  sourceFolderId: string;
  destinationFolderId: string;
}

export const DRAG_MIME_TYPE = "application/x-ryze-email";

export function hasDraggedEmailData(
  types: Iterable<string> | ArrayLike<string> | null | undefined,
): boolean {
  if (!types) return false;
  return Array.from(types).includes(DRAG_MIME_TYPE);
}

export function parseDraggedEmailData(
  getData: (type: string) => string,
): DraggedEmailData | null {
  const raw = getData(DRAG_MIME_TYPE);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.emailId !== "string" ||
      typeof parsed?.messageId !== "string" ||
      typeof parsed?.folderId !== "string"
    ) {
      return null;
    }

    return {
      emailId: parsed.emailId,
      messageId: parsed.messageId,
      folderId: parsed.folderId,
      subject: typeof parsed.subject === "string" ? parsed.subject : undefined,
    };
  } catch {
    return null;
  }
}

export function buildFolderDropPayload(
  getData: (type: string) => string,
  destinationFolderId: string,
): FolderDropPayload | null {
  const draggedEmail = parseDraggedEmailData(getData);
  if (!draggedEmail) return null;
  if (draggedEmail.folderId === destinationFolderId) return null;

  return {
    ...draggedEmail,
    sourceFolderId: draggedEmail.folderId,
    destinationFolderId,
  };
}
