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

// Centered modal shown when the update is downloaded and ready to install
export function UpdaterReadyModal() {
  const { status, installUpdate } = useUpdater();

  return (
    <AnimatePresence>
      {status === "ready" && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/50"
          />
          {/* Dialog */}
          <motion.div
            key="ready"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/2 z-[9999] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-[var(--border-0)] bg-[var(--bg-1)] p-6 shadow-2xl"
          >
            <div className="mb-1 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <h3 className="text-sm font-semibold text-[var(--fg-0)]">
                Update Ready to Install
              </h3>
            </div>
            <p className="mb-5 mt-2 text-sm text-[var(--fg-2)]">
              The new version has been downloaded and is ready to go. Restart
              the app to apply the update.
            </p>
            <button
              onClick={installUpdate}
              className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-500"
            >
              Restart & Install
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
