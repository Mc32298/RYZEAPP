import { EmailClient } from "./components/email/EmailClient";
import { UpdaterProvider, UpdaterReadyModal } from "./components/AutoUpdater";

function App() {
  return (
    <UpdaterProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-0)]">
        <div className="relative flex-1 overflow-hidden">
          <EmailClient />
        </div>
      </div>
      <UpdaterReadyModal />
    </UpdaterProvider>
  );
}

export default App;
