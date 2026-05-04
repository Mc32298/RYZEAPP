import { EmailClient } from "./components/email/EmailClient";
import { AutoUpdater } from "./components/AutoUpdater";

function App() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-0)]">
      <div className="relative flex-1 overflow-hidden">
        <EmailClient />
      </div>
      <AutoUpdater />
    </div>
  );
}

export default App;
