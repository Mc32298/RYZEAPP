export function buildGmailMoveLabelMutation(destination: string) {
  const normalizedDestination = destination.toUpperCase();

  if (normalizedDestination === "ARCHIVE") {
    return {
      addLabelIds: [] as string[],
      removeLabelIds: ["INBOX"],
    };
  }

  const addLabelIds = [normalizedDestination];
  const removeLabelIds = ["INBOX", "TRASH", "SPAM"].filter(
    (labelId) => labelId !== normalizedDestination,
  );

  return {
    addLabelIds,
    removeLabelIds,
  };
}
