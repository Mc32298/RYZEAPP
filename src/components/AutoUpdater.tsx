import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ElectronUpdaterAPI = {
  onUpdateAvailable?: (callback: (version: string) => void) => void;
  onUpdateDownloaded?: (callback: () => void) => void;
  removeUpdaterListeners?: () => void;
  startUpdateDownload?: () => void;
  installUpdate?: () => void;
};

export function AutoUpdater() {
  const [status, setStatus] = useState<
    "idle" | "available" | "downloading" | "ready"
  >("idle");
  const [newVersion, setNewVersion] = useState("");

  const electronAPI = window.electronAPI as ElectronUpdaterAPI;

  useEffect(() => {
    if (!electronAPI?.onUpdateAvailable) return;

    electronAPI.onUpdateAvailable((version: string) => {
      setNewVersion(version);
      setStatus("available");
    });

    electronAPI.onUpdateDownloaded?.(() => {
      setStatus("ready");
    });

    return () => {
      electronAPI?.removeUpdaterListeners?.();
    };
  }, []);

  const handleDownload = () => {
    electronAPI?.startUpdateDownload?.();
    setStatus("downloading");

    // Disappear silently after 3 seconds so they can keep working
    setTimeout(() => {
      if (status !== "ready") setStatus("idle");
    }, 3000);
  };

  const handleInstall = () => {
    electronAPI?.installUpdate?.();
  };

  if (status === "idle") return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence mode="wait">
        {status === "available" && (
          <motion.div
            key="available"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="w-[320px] rounded-md border border-[var(--email-border-strong)] bg-[var(--email-surface)] p-5 shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--email-text-strong)]">
                <Download size={18} className="text-[var(--email-accent)]" />
                <h3 className="font-fraunces font-semibold">
                  Update Available
                </h3>
              </div>
              <button
                onClick={() => setStatus("idle")}
                className="text-[var(--email-text-dim)] hover:text-[var(--email-danger)]"
              >
                <X size={16} />
              </button>
            </div>
            <p className="mb-5 font-space-grotesk text-sm text-[var(--email-text-muted)]">
              Version {newVersion} is available! Would you like to download it
              now?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setStatus("idle")}
                className="flex-1 rounded-sm border border-[var(--email-border)] px-3 py-1.5 font-space-grotesk text-xs font-semibold text-[var(--email-text)] hover:bg-[var(--email-surface-alt)]"
              >
                Later
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 rounded-sm bg-[var(--email-accent)] px-3 py-1.5 font-space-grotesk text-xs font-semibold text-[var(--email-accent-contrast)] hover:scale-[1.02] transition-transform"
              >
                Download
              </button>
            </div>
          </motion.div>
        )}

        {status === "downloading" && (
          <motion.div
            key="downloading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex w-[320px] items-center gap-3 rounded-md border border-[var(--email-border)] bg-[var(--email-surface)] p-4 shadow-xl"
          >
            <RefreshCw
              size={16}
              className="animate-spin text-[var(--email-accent)]"
            />
            <span className="font-space-grotesk text-sm font-medium text-[var(--email-text-muted)]">
              Downloading update securely...
            </span>
          </motion.div>
        )}

        {status === "ready" && (
          <motion.div
            key="ready"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-[320px] rounded-md border border-[var(--email-accent-border)] bg-[var(--email-surface)] p-5 shadow-2xl"
          >
            <h3 className="mb-2 font-fraunces font-semibold text-[var(--email-text-strong)]">
              Update Ready to Install
            </h3>
            <p className="mb-5 font-space-grotesk text-sm text-[var(--email-text-muted)]">
              The new version has been downloaded. Restart the app to apply the
              update.
            </p>
            <button
              onClick={handleInstall}
              className="w-full rounded-sm bg-[var(--email-accent)] px-3 py-2 font-space-grotesk text-sm font-semibold text-[var(--email-accent-contrast)] hover:scale-[1.02] transition-transform"
            >
              Restart & Install
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
