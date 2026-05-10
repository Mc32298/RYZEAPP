import { useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ComposeDraft as Draft } from "../components/email/ComposeDrawer";
import { toast } from "sonner";

export interface UseDraftPersistenceParams {
  drafts: Draft[];
  setDrafts: Dispatch<SetStateAction<Draft[]>>;
}

export function useDraftPersistence(
  params: UseDraftPersistenceParams,
): void {
  const { drafts, setDrafts } = params;
  const [hasLoadedDrafts, setHasLoadedDrafts] = useState(false);

  // Load drafts from storage on mount
  useEffect(() => {
    if (window.electronAPI?.getDrafts) {
      window.electronAPI
        .getDrafts()
        .then((savedDrafts) => {
          if (Array.isArray(savedDrafts) && savedDrafts.length > 0) {
            setDrafts(savedDrafts);
          }
          setHasLoadedDrafts(true);
        })
        .catch((err) => {
          console.error("Failed to load drafts:", err);
          setHasLoadedDrafts(true);
        });
    } else {
      setHasLoadedDrafts(true);
    }
  }, [setDrafts]);

  // Save drafts whenever they change (only after initial load)
  useEffect(() => {
    if (!hasLoadedDrafts) return;

    if (window.electronAPI?.saveDrafts) {
      window.electronAPI.saveDrafts(drafts);
    }
  }, [drafts, hasLoadedDrafts]);

  // Subscribe to draft save failure notifications
  useEffect(() => {
    if (!window.electronAPI?.onDraftsSaveFailed) return;
    window.electronAPI.onDraftsSaveFailed((message: string) => {
      toast.warning(message, { duration: 6000 });
    });
    return () => window.electronAPI?.removeDraftsListeners?.();
  }, []);
}
