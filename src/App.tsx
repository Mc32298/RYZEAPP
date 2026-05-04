import { TitleBar } from "./components/TitleBar";
import { EmailClient } from "./components/email/EmailClient";
import { AutoUpdater } from "./components/AutoUpdater";

function App() {
  return (
    // Wrap the entire app in a full-height column
    <div className="flex flex-col h-screen overflow-hidden bg-[#1A1814]">
      {/* The new Custom macOS Title Bar */}
      <TitleBar />

      {/* The rest of your application takes up the remaining space */}
      <div className="flex-1 overflow-hidden relative">
        <EmailClient />
      </div>
      <AutoUpdater />
    </div>
  );
}

export default App;
