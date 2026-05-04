export function buildGraphReplyPayload(comment: string) {
  return {
    comment: comment.trim() || " ",
  };
}
