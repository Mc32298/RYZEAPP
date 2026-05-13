import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ShieldCheck,
  RefreshCw,
  BellRing,
  X,
} from "lucide-react";

interface CalendarSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  events: any[];
  isLoading: boolean;
  lastSyncedAt: Date | null;
  mailboxCount: number;
  draftCount: number;
  privacyModeEnabled: boolean;
}

function parseEventStart(event: any) {
  const rawStart = event.start?.dateTime || event.start?.date;
  if (!rawStart) return null;

  const hasTimezone = /z$|[+-]\d{2}:\d{2}$/i.test(rawStart);
  const value =
    event.start?.date || hasTimezone ? rawStart : `${rawStart}Z`;
  const startDate = new Date(value);

  return Number.isNaN(startDate.getTime()) ? null : startDate;
}

export function CalendarSidebar({
  isOpen,
  onClose,
  events,
  isLoading,
  lastSyncedAt,
  mailboxCount,
  draftCount,
  privacyModeEnabled,
}: CalendarSidebarProps) {
  const upcomingEvents = events
    .map((event) => ({ ...event, startDate: parseEventStart(event) }))
    .filter((event): event is any & { startDate: Date } =>
      Boolean(event.startDate),
    )
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const nextEvents = upcomingEvents.slice(0, 3);
  const waitingItems = [
    `${draftCount} draft${draftCount === 1 ? "" : "s"} open`,
    `${mailboxCount} message${mailboxCount === 1 ? "" : "s"} indexed`,
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed right-0 top-[var(--topbar-h)] z-30 flex h-[calc(100vh-var(--topbar-h)-var(--statusbar-h))] w-[340px] flex-col overflow-hidden border-l border-[var(--border-subtle)] bg-[var(--bg-1)] text-[var(--fg-1)] shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]"
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-4">
            <div className="flex items-center gap-2 text-[var(--fg-0)]">
              <CalendarIcon size={16} strokeWidth={2} />
              <span className="font-medium tracking-normal">
                Agenda
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--fg-2)] hover:text-[var(--fg-1)] transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            <section className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-subtle)] bg-[var(--bg-0)] p-3">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-lg font-medium text-[var(--fg-0)]">
                    Today
                  </p>
                  <p className=" text-xs text-[var(--fg-3)]">
                    Next calendar commitments
                  </p>
                </div>
                <span className="rounded-[var(--radius-ryze-sm)] border border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] px-2 py-1 font-mono-jetbrains text-[10px] text-[var(--ryze-accent)]">
                  {nextEvents.length}/3
                </span>
              </div>

              {isLoading ? (
                <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-3  text-sm text-[var(--fg-2)]">
                  Loading calendar...
                </div>
              ) : nextEvents.length === 0 ? (
                <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-3  text-sm text-[var(--fg-2)]">
                  Calendar is clear. Use the space for follow-ups.
                </div>
              ) : (
                <div className="space-y-2">
                  {nextEvents.map((event) => {
                    const startDate = event.startDate;
                const isToday =
                  new Date().toDateString() === startDate.toDateString();

                return (
                  <div
                    key={event.id}
                        className="rounded-[var(--radius-ryze-md)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-3 transition-colors hover:border-[var(--border-0)]"
                  >
                    <div className="mb-2 line-clamp-2 text-[13px] font-medium leading-snug text-[var(--fg-0)]">
                      {event.subject || "(No title)"}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[var(--fg-3)] font-mono-jetbrains text-[10px]">
                        <Clock size={12} />
                        <span
                          className={
                            isToday
                              ? "text-[var(--ryze-accent)] font-bold"
                              : ""
                          }
                        >
                          {isToday
                            ? "Today"
                            : startDate.toLocaleDateString(undefined, {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                          {event.isAllDay
                            ? " • All Day"
                            : ` • ${startDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`}
                        </span>
                      </div>

                      {event.location?.displayName && (
                        <div className="flex items-center gap-1.5 text-[var(--fg-3)] font-mono-jetbrains text-[10px]">
                          <MapPin size={12} />
                          <span className="truncate">
                            {event.location.displayName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
                  })}
                </div>
              )}
            </section>

            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-subtle)] bg-[var(--bg-0)] p-3">
                <div className="mb-2 flex items-center gap-2 text-[var(--ryze-accent)]">
                  <RefreshCw size={13} />
                  <span className=" text-[10px] font-bold uppercase tracking-wider">
                    Sync
                  </span>
                </div>
                <p className=" text-xs text-[var(--fg-1)]">
                  {lastSyncedAt
                    ? `Updated ${lastSyncedAt.toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                    : "Waiting for first sync"}
                </p>
              </div>

              <div className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-subtle)] bg-[var(--bg-0)] p-3">
                <div className="mb-2 flex items-center gap-2 text-[var(--ryze-accent)]">
                  <ShieldCheck size={13} />
                  <span className=" text-[10px] font-bold uppercase tracking-wider">
                    Privacy
                  </span>
                </div>
                <p className=" text-xs text-[var(--fg-1)]">
                  {privacyModeEnabled
                    ? "Remote images guarded"
                    : "Remote images allowed"}
                </p>
              </div>
            </section>

            <section className="rounded-[var(--radius-ryze-sm)] border border-[var(--border-subtle)] bg-[var(--bg-0)] p-3">
              <div className="mb-3 flex items-center gap-2 text-[var(--fg-0)]">
                <BellRing size={13} className="text-[var(--ryze-accent)]" />
                <h2 className=" text-xs font-bold uppercase tracking-wider">
                  Waiting On
                </h2>
              </div>
              <div className="space-y-2">
                {waitingItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-[var(--radius-ryze-sm)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-2"
                  >
                    <span className=" text-xs text-[var(--fg-2)]">
                      {item}
                    </span>
              <span className="h-1.5 w-1.5 rounded-[2px] bg-[var(--ryze-accent)]" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
