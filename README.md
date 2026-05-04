# RYZE Mail
 
**The open-source desktop email client built for people who actually care about their privacy.**
 
RYZE is a lightweight, fast, and secure Electron-based email client for Windows, macOS, and Linux. No subscriptions. No tracking. No bloat. Just your email — owned by you, stored on your machine, working for you.
 
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/)
[![Security: Sandboxed](https://img.shields.io/badge/Security-Sandboxed-success)](https://www.electronjs.org/docs/latest/tutorial/sandbox)
[![Built with Electron](https://img.shields.io/badge/Built%20with-Electron-47848F)](https://electronjs.org)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61DAFB)](https://reactjs.org)
 
---
 
## Why RYZE?
 
Modern email clients have become surveillance platforms. They track what you open, load invisible pixels to report back to senders, sync everything to cloud servers you don't control, and bundle so much cruft that launching them feels sluggish.
 
RYZE was built on a different premise: **your inbox is yours.**
 
- **No cloud accounts.** RYZE has no RYZE account, no RYZE servers, no telemetry. Zero.
- **Local-first storage.** Your emails live in a SQLite database on your machine, encrypted at rest.
- **Open source.** Every line of code is auditable. Trust no one — verify everything yourself.
- **Multi-account.** Connect as many Microsoft / Outlook / Hotmail accounts as you need, all in one unified view.
- **AI-assisted, not AI-dependent.** Optional on-device AI summaries via Gemini — you configure the key, you own the data flow.
---
 
## Screenshots
 
> _Coming soon — contributions welcome._
 
---
 
## Features
 
### Privacy & Security First
 
| Feature | How it works |
|---|---|
| **Remote image blocking** | Invisible tracking pixels are blocked by default. You decide per-sender whether to trust images. |
| **Isolated cookie jars** | Each email account runs in its own persistent partition. Accounts can never cross-contaminate session tokens or cookies. |
| **URL whitelisting** | Every link you click is inspected before opening. Unsafe protocols are blocked outright. External links open in your system browser — never inside the app. |
| **Encrypted token storage** | OAuth tokens are encrypted using Electron's `safeStorage` API, which delegates to your OS keychain (macOS Keychain, Windows Credential Store, Linux libsecret). |
| **Sandboxed renderer** | The UI runs in a fully sandboxed Chromium context. `nodeIntegration` is disabled. `contextIsolation` is enabled. The renderer cannot touch the filesystem or Node.js directly. |
| **Session lock** | Optionally lock the inbox after a configurable idle timeout or when the window loses focus. |
| **Link confirmation** | Optionally prompt before opening any external link, so you always know where you're going. |
| **No analytics, no ads** | RYZE collects nothing. There is no analytics SDK in this codebase. |
 
### Email & Accounts
 
- **Microsoft OAuth 2.0 + PKCE** — Industry-standard secure login flow. No passwords stored. Refresh tokens are encrypted at rest.
- **Unified inbox** — View all inboxes or all sent mail across every connected account in a single feed.
- **Full folder sync** — All folders, including sub-folders, are synced recursively. Depth and hierarchy are preserved.
- **Delta sync** — After the initial full sync, RYZE only fetches changes. Fast background refreshes every 60 seconds for your active folder, full delta sync every 15 minutes.
- **Offline-first** — Emails are cached locally in SQLite. Open RYZE with no internet and your mail is still there.
- **Send email** — Compose and send via the Microsoft Graph API. CC support, HTML body, inline reply quoting.
- **Reply, Reply All, Forward** — With optional email signature automatically injected.
- **Attachment downloads** — Secure, user-prompted save dialog. Attachment bytes are only fetched after you choose a save location.
### Organisation
 
- **Labels** — Create colour-coded labels and assign them to any message. Labels persist across syncs.
- **Custom folders** — Create, rename, and delete mail folders directly from the sidebar. Changes propagate to the server.
- **Drag-and-drop** — Drag messages from the list onto any folder in the sidebar to move them.
- **Bulk actions** — Select multiple messages and move, label, or delete them in one action.
- **Starring** — Flag important messages. Star state syncs bidirectionally with the server.
- **Mark read / unread** — With self-healing: if a message was deleted on the server, the stale local copy is automatically removed.
- **Snooze** — Hide a message from view temporarily.
- **Empty folder** — Clear a folder in one click (moves to Trash or permanently deletes from Deleted Items).
### Compose
 
- **Multiple draft windows** — Open several compose windows simultaneously, each independent.
- **Minimise to taskbar** — Drafts can be minimised to a floating tab at the bottom of the screen without being discarded.
- **Fullscreen compose** — Expand any draft to fill the window for longer writing sessions.
- **Encrypted draft persistence** — Unsent drafts are saved to disk using `safeStorage` encryption and restored the next time you open RYZE.
- **HTML compose** — Write with basic formatting. Content is sanitised with DOMPurify before sending.
### Reading
 
- **Sandboxed email rendering** — Email bodies render inside a sandboxed `<iframe>`. Scripts, forms, embeds, objects, and iframes in email content are all stripped.
- **HTML sanitisation** — DOMPurify + custom attribute scrubbing removes tracking attributes, event handlers, dangerous protocols, and unsafe URLs before rendering.
- **Trusted senders** — Allow specific senders to load remote images automatically. Trust preference is saved locally.
- **AI Summary (optional)** — One-click AI-powered summary of any email via the Gemini API. Requires a `GEMINI_API_KEY` in your `.env`. Nothing is sent unless you click the button.
- **Attachment panel** — Inline attachment list with file name, size, and one-click secure download.
### Calendar
 
- **Agenda sidebar** — Toggle an agenda panel (`T` key) showing your next 14 days of Microsoft calendar events with time, date, and location.
### Keyboard Navigation
 
| Key | Action |
|---|---|
| `C` | Compose new message |
| `R` | Reply to selected message |
| `E` | Archive selected message |
| `T` | Toggle calendar agenda sidebar |
| `↑ / ↓` | Navigate between messages |
| `/` | Focus the search bar |
 
### Themes & Appearance
 
- **Obsidian** — Deep, warm dark theme. The default.
- **Linen** — Soft cream light theme for daytime use.
- **System** — Follows your OS light/dark preference automatically.
- **Comfortable / Compact density** — Control how much information each message row shows.
- **Preview text toggle** — Show or hide the snippet below the subject line.
- **Avatar toggle** — Show or hide sender initials.
---
 
## Architecture
 
```
ryze/
├── electron/
│   ├── main.ts          # Main process: SQLite, OAuth, IPC handlers, sync engine
│   └── preload.ts       # Context bridge: validated, typed API surface for the renderer
├── src/
│   ├── components/
│   │   ├── email/
│   │   │   ├── EmailClient.tsx      # Root app state, sync orchestration
│   │   │   ├── Sidebar.tsx          # Folder tree, labels, account switcher
│   │   │   ├── MessageList.tsx      # Email list with bulk actions & search
│   │   │   ├── ReadingPane.tsx      # Sandboxed email renderer, AI summary
│   │   │   ├── ComposeDrawer.tsx    # Multi-draft compose UI
│   │   │   └── CalendarSidebar.tsx  # Agenda panel
│   │   └── ui/                      # shadcn/ui component library
│   └── types/
│       ├── email.ts                 # Core domain types
│       └── electron.d.ts            # Window.electronAPI type definitions
```
 
### Data flow
 
```
Microsoft Graph API
        │
        ▼
  Main Process (main.ts)
  ├── OAuth token management (safeStorage)
  ├── Folder + message sync (delta / full)
  ├── SQLite (emails.db)
  └── IPC handlers
        │
   contextBridge (preload.ts)
   [validated, typed, sanitised]
        │
        ▼
  Renderer (React)
  ├── EmailClient.tsx  (state)
  ├── MessageList      (display)
  ├── ReadingPane      (sandboxed iframe)
  └── ComposeDrawer    (drafts)
```
 
### Database schema (SQLite)
 
| Table | Purpose |
|---|---|
| `emails` | Cached message metadata and body content |
| `folders` | Mail folder tree with depth and path |
| `labels` | User-created labels with colour |
| `email_labels` | Many-to-many message ↔ label mapping |
| `folder_sync_state` | Delta link per folder for incremental sync |
 
---
 
## Configuration reference
 
All settings are saved locally in `localStorage` and optionally synced to the backend via `ryze-settings.json` in Electron's userData directory.
 
| Setting | Default | Description |
|---|---|---|
| Theme | Obsidian | Dark / light / system |
| Density | Comfortable | Message list row height |
| Preview text | On | Show body snippet in list |
| Avatars | On | Show sender initials |
| Block remote images | On | Prevent tracking pixels |
| Confirm external links | On | Prompt before opening links |
| Session lock | Off | Auto-lock on idle / blur |
| Auto-delete trash | 30 days | Local cleanup window |
| Sync window | 90 days | How far back to sync |
| Keep attachments offline | On | Cache attachment metadata |
| Desktop alerts | On | OS-level new mail notifications |
| Signature | Empty | Auto-appended to new drafts |
 
---
 
## Privacy guarantees
 
- **No RYZE servers.** There are no backend services operated by this project. All data flows between your machine and Microsoft's Graph API directly.
- **No telemetry.** There is no analytics, crash reporting, or usage tracking of any kind in this codebase.
- **Tokens encrypted at rest.** Microsoft OAuth tokens are encrypted using your OS keychain via Electron `safeStorage` before being written to disk. The file is written with mode `0600` (owner read/write only).
- **Drafts encrypted at rest.** Unsent drafts are encrypted with the same `safeStorage` mechanism before being saved.
- **Renderer is sandboxed.** The UI cannot access Node.js, the filesystem, or any Electron API directly. All privileged operations pass through a strictly validated `contextBridge`.
- **Email content is sanitised.** Every email body is processed through DOMPurify with a restrictive allow-list before being rendered in a sandboxed iframe. Tracking attributes, event handlers, and unsafe protocols are stripped.
- **Remote images blocked by default.** Images from external URLs will not load unless you explicitly allow them for a specific sender or for a single viewing session.
---
 
## Roadmap
 
- [ ] **Gmail / Google Workspace support** via Google OAuth + Gmail API
- [ ] **iCloud Mail support**
- [ ] **Passkey / WebAuthn authentication** for session unlock
- [ ] **Split view** — inbox alongside calendar, Notion, or Todoist
- [ ] **Snooze with persistence** — database-backed snooze reminders
- [ ] **Custom notification sounds**
- [ ] **macOS and iOS native wrappers**
- [ ] **End-to-end encrypted local storage** option
- [ ] **Thread view** — group replies into a conversation
- [ ] **Search across all folders** — full-text SQLite FTS5 index
- [ ] **Built-in Notion integration**
- [ ] **Built-in Todoist integration**
---
 
## Contributing
 
Contributions are very welcome. RYZE is a community project and we want to keep it that way.
 
If you find a bug, have a feature idea, or want to improve security:
 
1. **Open an issue** to discuss your idea before writing code.
2. **Fork and branch** — use descriptive branch names like `fix/attachment-download-crash` or `feat/gmail-oauth`.
3. **Write clean code** — the codebase uses TypeScript throughout. Maintain the existing patterns and security model.
4. **Open a pull request** with a clear description of what changed and why.
### Security issues
 
Please do **not** file public issues for security vulnerabilities. Email the maintainers directly so the issue can be assessed and patched before disclosure.
 
---
 
## Tech stack
 
| Layer | Technology |
|---|---|
| Shell | [Electron](https://electronjs.org) |
| Frontend | [React](https://reactjs.org) + [TypeScript](https://www.typescriptlang.org) |
| Build | [Vite](https://vitejs.dev) |
| Styling | [Tailwind CSS](https://tailwindcss.com) |
| Components | [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://www.radix-ui.com) |
| Animation | [Framer Motion](https://www.framer.com/motion) |
| Database | [SQLite](https://sqlite.org) via [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) |
| Email API | [Microsoft Graph API](https://learn.microsoft.com/en-us/graph/overview) |
| Sanitisation | [DOMPurify](https://github.com/cure53/DOMPurify) |
| AI | [Google Gemini API](https://ai.google.dev) (optional) |
| Fonts | [Fraunces](https://fonts.google.com/specimen/Fraunces), [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk), [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) |
 
---
 
## License
 
RYZE Mail is open source software licensed under the [MIT License](LICENSE).
 
---
 
> **RYZE Mail** — Open source. Private by default. Built for everyone.
