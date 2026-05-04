import React, { createContext, useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw } from "lucide-react";

type UpdaterStatus = "idle" | "available" | "downloading" | "ready";

type UpdaterContextValue = {
  status: UpdaterStatus;
  startDownload: () => void;
  installUpdate: () => void;
};

const UpdaterContext = createContext<UpdaterContextValue>({
  status: "idle",
  startDownload: () => {},
  installUpdate: () => {},
});

export function useUpdater() {
  return useContext(UpdaterContext);
}

type ElectronUpdaterAPI = {
  onUpdateAvailable?: (callback: (version: string) => void) => void;
  onUpdateDownloaded?: (callback: () => void) => void;
  removeUpdaterListeners?: () => void;
  startUpdateDownload?: () => void;
  installUpdate?: () => void;
};

export function UpdaterProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<UpdaterStatus>("idle");

  const electronAPI = (window as any).electronAPI as ElectronUpdaterAPI;

  useEffect(() => {
    if (!electronAPI?.onUpdateAvailable) return;

    electronAPI.onUpdateAvailable(() => {
      setStatus("available");
    });

    electronAPI.onUpdateDownloaded?.(() => {
      setStatus("ready");
    });

    return () => {
      electronAPI?.removeUpdaterListeners?.();
    };
  }, []);

  const startDownload = () => {
    electronAPI?.startUpdateDownload?.();
    setStatus("downloading");
  };

  const installUpdate = () => {
    electronAPI?.installUpdate?.();
  };

  return (
    <UpdaterContext.Provider value={{ status, startDownload, installUpdate }}>
      {children}
    </UpdaterContext.Provider>
  );
}

// Renders in the top bar — green download icon when available, spinner when downloading
export function UpdaterTopBarButton() {
  const { status, startDownload } = useUpdater();

  if (status === "idle" || status === "ready") return null;

  if (status === "downloading") {
    return (
      <div
        className="flex h-7 w-7 items-center justify-center rounded-[6px]"
        title="Downloading update..."
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <RefreshCw size={14} className="animate-spin" style={{ color: "#22c55e" }} />
      </div>
    );
  }

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

// Floating popup shown when the update is downloaded and ready to install
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
