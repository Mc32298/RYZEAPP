import type { EmailThread, EmailThreadRow } from "@/types/email";

export interface ConversationThread {
  key: string;
  messages: EmailThread[];
}

export interface TrimmedMessageBody {
  visibleHtml: string;
  quotedHtml: string;
}

function normalizeSubject(subject: string) {
  return subject.replace(/^(re|fwd):\s*/gi, "").trim().toLowerCase();
}

function messageParticipants(email: EmailThread) {
  return new Set([
    email.sender.email.toLowerCase(),
    ...email.to.map((value) => value.toLowerCase()),
    ...(email.cc || []).map((value) => value.toLowerCase()),
  ]);
}

function sharesParticipants(left: EmailThread, right: EmailThread) {
  const leftSet = messageParticipants(left);
  const rightSet = messageParticipants(right);

  for (const value of leftSet) {
    if (rightSet.has(value)) return true;
  }

  return false;
}

function matchesFallbackThread(selected: EmailThread, candidate: EmailThread) {
  if (selected.accountId !== candidate.accountId) {
    return false;
  }

  if (normalizeSubject(selected.subject) !== normalizeSubject(candidate.subject)) {
    return false;
  }

  return sharesParticipants(selected, candidate);
}

function buildThreadKey(email: EmailThread) {
  return (
    email.conversationId ||
    `${email.accountId}:${normalizeSubject(email.subject)}:${email.sender.email.toLowerCase()}`
  );
}

function groupMessagesForList(emails: EmailThread[]) {
  const groups = new Map<string, EmailThread[]>();

  for (const email of emails) {
    const matchingEntry = Array.from(groups.entries()).find(([, grouped]) => {
      if (email.conversationId) {
        return grouped.some(
          (candidate) =>
            candidate.accountId === email.accountId &&
            candidate.conversationId === email.conversationId,
        );
      }

      return grouped.some((candidate) => matchesFallbackThread(candidate, email));
    });

    const key = matchingEntry?.[0] || buildThreadKey(email);
    groups.set(key, [...(groups.get(key) || []), email]);
  }

  return groups;
}

export function buildConversationThread(
  selected: EmailThread,
  emails: EmailThread[],
): ConversationThread {
  const messages = selected.conversationId
    ? emails.filter(
        (item) =>
          item.accountId === selected.accountId &&
          item.conversationId === selected.conversationId,
      )
    : emails.filter((item) => matchesFallbackThread(selected, item));

  const deduped = Array.from(
    new Map([selected, ...messages].map((item) => [item.id, item])).values(),
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return {
    key:
      selected.conversationId ||
      `${selected.accountId}:${normalizeSubject(selected.subject)}:${selected.sender.email.toLowerCase()}`,
    messages: deduped,
  };
}

export function buildThreadListRows(emails: EmailThread[]): EmailThreadRow[] {
  return Array.from(groupMessagesForList(emails).entries())
    .map(([threadKey, messages]) => {
      const sorted = [...messages].sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );
      const latestMessage = sorted[0];
      const participants = new Set(
        sorted.map((message) => message.sender.email.toLowerCase()),
      );

      return {
        threadKey,
        latestMessage,
        messageIds: sorted.map((message) => message.id),
        messages: sorted,
        threadCount: sorted.length,
        participantCount: participants.size,
        hasUnread: sorted.some((message) => !message.isRead),
        hasAttachment: sorted.some((message) => message.hasAttachment),
        labels: latestMessage.labels,
      };
    })
    .sort(
      (left, right) =>
        right.latestMessage.timestamp.getTime() -
        left.latestMessage.timestamp.getTime(),
    );
}

export function threadRowMatchesFilters(
  row: EmailThreadRow,
  {
    query,
    activeFilters,
  }: { query: string; activeFilters: string[] },
) {
  const normalizedQuery = query.trim().toLowerCase();

  const matchesSearch =
    !normalizedQuery ||
    row.messages.some((message) =>
      [
        message.sender.name,
        message.subject,
        message.preview,
        message.body,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery)),
    );

  const matchesUnread = !activeFilters.includes("Unread") || row.hasUnread;
  const matchesFlagged =
    !activeFilters.includes("Flagged") ||
    row.messages.some((message) => message.isStarred);
  const matchesAttachment =
    (!activeFilters.includes("Has Attachment") &&
      !activeFilters.includes("Has files")) ||
    row.hasAttachment;

  return matchesSearch && matchesUnread && matchesFlagged && matchesAttachment;
}

export function getDefaultExpandedMessageIds(messages: EmailThread[]) {
  const newest = [...messages].sort(
    (left, right) => right.timestamp.getTime() - left.timestamp.getTime(),
  )[0];

  return newest ? [newest.id] : [];
}

export function getReadingTimelineMessages(messages: EmailThread[]) {
  return [...messages].sort(
    (left, right) => left.timestamp.getTime() - right.timestamp.getTime(),
  );
}

export function scrollReadingTimelineToBottom(
  scrollContainer: Pick<HTMLElement, "scrollTop" | "scrollHeight"> | null,
) {
  if (!scrollContainer) return;
  scrollContainer.scrollTop = scrollContainer.scrollHeight;
}

export function stripQuotedHtml(html: string): TrimmedMessageBody {
  const quotePatterns = [
    /<blockquote\b[\s\S]*<\/blockquote>/i,
    /<[^>]+(?:class|id)=["'][^"']*(?:gmail_quote|gmail_attr|yahoo_quoted|moz-cite-prefix|divRplyFwdMsg)[^"']*["'][\s\S]*$/i,
  ];

  for (const pattern of quotePatterns) {
    const match = html.match(pattern);

    if (!match || typeof match.index !== "number") {
      continue;
    }

    const quotedHtml = html.slice(match.index).trim();
    const visibleHtml = html.slice(0, match.index).trim();

    return {
      visibleHtml: visibleHtml || html,
      quotedHtml,
    };
  }

  return { visibleHtml: html, quotedHtml: "" };
}
