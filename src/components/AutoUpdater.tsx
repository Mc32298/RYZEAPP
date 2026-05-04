import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Download, RefreshCw } from "lucide-react";

type UpdaterStatus = "idle" | "available" | "downloading" | "error" | "ready";

type UpdaterContextValue = {
  status: UpdaterStatus;
  errorMessage: string;
  startDownload: () => void;
  installUpdate: () => void;
};

const UpdaterContext = createContext<UpdaterContextValue>({
  status: "idle",
  errorMessage: "",
  startDownload: () => {},
  installUpdate: () => {},
});

export function useUpdater() {
  return useContext(UpdaterContext);
}

type ElectronUpdaterAPI = {
  checkUpdates?: () => void;
  onUpdateAvailable?: (callback: (version: string) => void) => void;
  onUpdateDownloaded?: (callback: () => void) => void;
  onUpdateError?: (callback: (message: string) => void) => void;
  removeUpdaterListeners?: () => void;
  startUpdateDownload?: () => void;
  installUpdate?: () => void;
};

export function UpdaterProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<UpdaterStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const electronAPI = (window as any).electronAPI as ElectronUpdaterAPI;

  useEffect(() => {
    if (!electronAPI?.onUpdateAvailable) return;

    // Trigger the check from the renderer so we don't depend on
    // the main-process 5-second timeout racing with listener setup
    electronAPI.checkUpdates?.();

    electronAPI.onUpdateAvailable(() => {
      setStatus("available");
    });

    electronAPI.onUpdateDownloaded?.(() => {
      setStatus("ready");
    });

    electronAPI.onUpdateError?.((message) => {
      setErrorMessage(message);
      // Reset to available so the user can see the error and retry
      setStatus("error");
      // Auto-clear the error icon after 8 seconds and go back to available
      setTimeout(() => setStatus("available"), 8000);
    });

    return () => {
      electronAPI?.removeUpdaterListeners?.();
    };
  }, []);

  const startDownload = () => {
    setErrorMessage("");
    electronAPI?.startUpdateDownload?.();
    setStatus("downloading");
  };

  const installUpdate = () => {
    electronAPI?.installUpdate?.();
  };

  return (
    <UpdaterContext.Provider value={{ status, errorMessage, startDownload, installUpdate }}>
      {children}
    </UpdaterContext.Provider>
  );
}

// Renders in the top bar
export function UpdaterTopBarButton() {
  const { status, errorMessage, startDownload } = useUpdater();

  if (status === "idle" || status === "ready") return null;

  if (status === "downloading") {
    return (
      <div
        className="flex h-7 w-7 items-center justify-center rounded-[6px]"
        title="Downloading update in the background..."
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <RefreshCw size={14} className="animate-spin" style={{ color: "#22c55e" }} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="flex h-7 w-7 items-center justify-center rounded-[6px]"
        title={`Update failed: ${errorMessage}`}
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <AlertCircle size={14} style={{ color: "#f87171" }} />
      </div>
    );
  }

  // available
  return (
    <button
      onClick={startDownload}
      className="flex h-7 w-7 items-center justify-center rounded-[6px] transition-colors hover:bg-[var(--bg-2)]"
      title="Update available — click to download"
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
    >
      <Download size={14} style={{ color: "#22c55e" }} />
    </button>
  );
}

// Floating popup shown when the update is ready to install
export function UpdaterReadyModal() {
  const { status, installUpdate } = useUpdater();

  return (
    <AnimatePresence>
      {status === "ready" && (
        <motion.div
          key="ready"
          initial={{ opacity: 0, y: 16, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          className="fixed bottom-6 right-6 z-[9999] w-[300px] rounded-md border border-[var(--email-border-strong)] bg-[var(--email-surface)] p-5 shadow-2xl"
        >
          <h3 className="mb-2 font-fraunces font-semibold text-[var(--email-text-strong)]">
            Update Ready
          </h3>
          <p className="mb-4 font-space-grotesk text-sm text-[var(--email-text-muted)]">
            The update has been downloaded. Restart to apply it.
          </p>
          <button
            onClick={installUpdate}
            className="w-full rounded-sm bg-[var(--email-accent)] px-3 py-2 font-space-grotesk text-sm font-semibold text-[var(--email-accent-contrast)] transition-transform hover:scale-[1.02]"
          >
            Restart & Install
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
