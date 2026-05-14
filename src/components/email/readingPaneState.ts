import type { EmailThread } from "@/types/email";
import { getDefaultExpandedMessageIds } from "./threadView";

export interface ReadingPaneViewState {
  threadAnchorId: string | null;
  activeMessageId: string | null;
  expandedMessageIds: string[];
  quotedOpenById: Record<string, boolean>;
}

export function createInitialReadingPaneViewState(): ReadingPaneViewState {
  return {
    threadAnchorId: null,
    activeMessageId: null,
    expandedMessageIds: [],
    quotedOpenById: {},
  };
}

function createThreadBaseline(
  threadAnchorId: string | null,
  messages: EmailThread[],
): ReadingPaneViewState {
  return {
    threadAnchorId,
    activeMessageId: messages[0]?.id || threadAnchorId || null,
    expandedMessageIds: getDefaultExpandedMessageIds(messages),
    quotedOpenById: {},
  };
}

export function reconcileReadingPaneViewState(
  previous: ReadingPaneViewState,
  {
    threadAnchorId,
    messages,
  }: {
    threadAnchorId: string | null;
    messages: EmailThread[];
  },
): ReadingPaneViewState {
  if (!threadAnchorId || messages.length === 0) {
    return createInitialReadingPaneViewState();
  }

  if (previous.threadAnchorId !== threadAnchorId) {
    return createThreadBaseline(threadAnchorId, messages);
  }

  const messageIds = new Set(messages.map((message) => message.id));
  const activeMessageId =
    previous.activeMessageId && messageIds.has(previous.activeMessageId)
      ? previous.activeMessageId
      : messages[0]?.id || threadAnchorId;

  const expandedMessageIds = previous.expandedMessageIds.filter((id) =>
    messageIds.has(id),
  );
  const nextExpandedMessageIds =
    expandedMessageIds.length > 0
      ? expandedMessageIds
      : getDefaultExpandedMessageIds(messages);

  const quotedOpenById = Object.fromEntries(
    Object.entries(previous.quotedOpenById).filter(([id]) => messageIds.has(id)),
  );
  const nextState: ReadingPaneViewState = {
    threadAnchorId,
    activeMessageId,
    expandedMessageIds: nextExpandedMessageIds,
    quotedOpenById,
  };

  if (
    previous.threadAnchorId === nextState.threadAnchorId &&
    previous.activeMessageId === nextState.activeMessageId &&
    previous.expandedMessageIds.length === nextState.expandedMessageIds.length &&
    previous.expandedMessageIds.every(
      (id, index) => id === nextState.expandedMessageIds[index],
    ) &&
    Object.keys(previous.quotedOpenById).length ===
      Object.keys(nextState.quotedOpenById).length &&
    Object.entries(previous.quotedOpenById).every(
      ([id, value]) => nextState.quotedOpenById[id] === value,
    )
  ) {
    return previous;
  }

  return nextState;
}
