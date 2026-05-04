import { EmailClient } from "./components/email/EmailClient";
import { UpdaterProvider, UpdaterReadyModal } from "./components/AutoUpdater";
import { Toaster } from "./components/ui/sonner";

function App() {
  return (
    <UpdaterProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-0)]">
        <div className="relative flex-1 overflow-hidden">
          <EmailClient />
        </div>
      </div>
      <UpdaterReadyModal />
      <Toaster />
    </UpdaterProvider>
  );
}

export default App;
