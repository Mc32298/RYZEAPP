# RYZE Mail Visual Redesign

## Purpose

RYZE Mail already has a working Electron and React email client. This pass updates the visible product UI to match the new RYZE Mail desktop design system while preserving existing mail behavior.

The source visual reference is:

- `C:\Users\MathiasNielsen-SPINO\Downloads\NewWebsite\ui_kits\desktop\RYZE Mail.html`
- `C:\Users\MathiasNielsen-SPINO\Downloads\NewWebsite\colors_and_type.css`
- `C:\Users\MathiasNielsen-SPINO\Downloads\NewWebsite\assets`
- `C:\Users\MathiasNielsen-SPINO\Downloads\NewWebsite\preview`

Feature additions from the new design kit are deferred to a later pass. This pass is visual and structural only.

## Approved Direction

Use the desktop UI kit as the source of truth:

- 44px top bar.
- 240px sidebar.
- 360px message list.
- Flexible reader pane.
- 24px status bar.
- Dark-first warm neutral palette.
- Burnt amber accent for primary actions, focus, and selected states.
- Poppins for human-readable UI and message chrome.
- JetBrains Mono for metadata, addresses, timestamps, keyboard hints, and system labels.
- Lucide icons at 1.5px stroke.
- Flat opaque surfaces with hairline borders.
- Shadows only for popovers, modals, dropdowns, and the floating compose window.

Theme mode remains available. Dark mode is the primary polished target. Light mode should be implemented through the new token override model instead of the current custom theme palette.

## Scope

Restyle every visible email surface:

- App shell.
- Top bar.
- Sidebar.
- Message list.
- Reading pane.
- Compose window.
- Settings modal.
- Calendar sidebar.
- AI insights rail.
- Tutorial overlay.
- Session lock overlay.
- Empty states.
- Bulk selection toolbar.
- Shortcut and status UI.
- Context menus, dropdowns, popovers, buttons, inputs, badges, and tags used by the email UI.

Do not change mail behavior in this pass:

- Microsoft account connection.
- Local mailbox loading.
- Sync and refresh.
- Folder and label operations.
- Drag/drop between folders.
- Search and filtering.
- Thread selection.
- Reply, reply all, forward, archive, delete, mark unread, star, and snooze actions.
- Compose draft autosave, minimize, fullscreen, restore, close, and send.
- Attachment download.
- Calendar loading.
- AI reply tone actions.
- Session lock behavior.

## Architecture

`EmailClient.tsx` remains the coordinator for accounts, folders, labels, sync state, selected message/thread, compose drafts, settings, calendar state, session lock, tutorial state, and keyboard shortcuts.

The visual migration should be token-first:

1. Add or map the RYZE design tokens in the app stylesheet.
2. Replace the current luxury/glass variables and utility classes with RYZE-compatible token usage.
3. Keep component ownership boundaries intact.
4. Restyle components in place unless a small extracted shell component makes the layout clearer.

Existing React props and handlers should continue flowing through the same components. The implementation should avoid rebuilding the app as a separate UI layer unless a component is too tangled to restyle safely.

## Component Treatment

### App Shell

The app shell becomes a fixed desktop mail layout:

- Top bar spans all panes.
- Body uses a three-column grid.
- Bottom status bar spans all panes.
- The current floating shortcut bar should become part of the status bar or be visually reconciled with it.
- No product UI gradients, decorative orbs, glass panels, or broad shadows.

### Sidebar

The sidebar should match the kit:

- RYZE wordmark/account area.
- 32px amber compose button.
- Compact mailbox rows.
- Mono uppercase section labels.
- Active row uses `bg-3` plus a 2px amber left border.
- Counts use mono.
- Existing folder and label context menu behavior remains.
- Existing folder creation, rename, delete, empty, icon, and email drop behavior remains.

### Message List

The message list adopts the kit's dense row model:

- About 64px rows in default density.
- Sender, subject, preview, and timestamp hierarchy.
- Unread indicator.
- Selected row left accent.
- Inline tags for attachment, thread count, labels, and related metadata.
- Search and filter controls styled from the kit.
- Bulk selection remains available.
- Bulk toolbar should become a flat popover-style control instead of a glass overlay.

### Reader

The reader gets the kit treatment:

- 44px toolbar.
- Compact icon/action buttons.
- 720px max thread content.
- 24px subject heading.
- Mono metadata.
- Subdued labels.
- Flat thread and message sections with hairline separators.
- Existing remote image blocking and unsafe link protections remain.

### Compose

Compose remains a floating window because the design system explicitly permits compose elevation/backdrop behavior. It should use:

- Flat RYZE surfaces.
- Hairline border.
- Minimal shadow.
- Poppins fields and body.
- Mono metadata/autosave hints.
- Existing draft and AI tone behavior.

### Settings, Calendar, And Insights

Settings, calendar, and AI insights should look like utility surfaces in the same system:

- No Fraunces headings.
- No premium/luxury panel styling.
- Poppins headings and labels.
- Mono metadata and status text.
- Tokenized flat surfaces.
- Shadows only for modal/popover elevation.

The AI insights rail remains available, but the visual language should be restrained and product-like.

### Tutorial And Lock Overlays

Tutorial copy should be cleaned up to match the design system voice:

- Sentence case.
- No emoji.
- No excitement copy.
- No exclamation marks.
- Direct language.

The lock overlay should use a modal surface with the new tokens and no glassmorphism except where a modal backdrop blur is already necessary for focus.

## Token And Styling Rules

Use the RYZE tokens from `colors_and_type.css` as the model:

- `--bg-0` through `--bg-4`.
- `--fg-0` through `--fg-3`.
- `--border-0`, `--border-1`, `--border-subtle`.
- `--accent`, `--accent-hover`, `--accent-active`, `--accent-soft`, `--accent-fg`.
- Semantic success, warning, danger, and info tokens.
- `--font-sans` and `--font-mono`.
- 4px spacing scale.
- 7px default radius.

Avoid new hardcoded colors. Existing sender/avatar colors may remain data-driven. If a new semantic token is necessary, it belongs in the central stylesheet, not in component-local CSS.

## Content Rules

Use RYZE voice rules in app chrome:

- Sentence case for labels.
- `RYZE` uppercase.
- No emoji in product UI.
- Short direct copy.
- Technical terms are allowed when accurate.
- Keep `Your inbox is yours` as the north-star line where onboarding or empty states need a brand statement.

User email content is not rewritten or restricted by these rules.

## Verification

Run type and behavior checks:

- `npm run lint`
- Focused Vitest suites for email thread/list/rendering behavior, including the existing thread view, message rendering, search, sidebar drag/drop, and insights tests where relevant.

Run visual verification through the local dev server:

- Normal inbox with selected thread.
- Empty folder or no selected message.
- Compose window.
- Settings modal.
- Calendar sidebar.
- AI insights rail.
- Bulk selection toolbar.
- Tutorial overlay.
- Session lock overlay.
- Dark mode.
- Light mode.

The pass is complete when the app visually matches the approved RYZE shell direction and the existing mail workflows still function.

## Out Of Scope

- New mailbox features from the design kit that are not already wired.
- Replacing Microsoft sync logic.
- Reworking the local database.
- Rebuilding the email parser or sanitizer.
- Mobile layouts.
- Marketing pages.
- New brand photography or AI-generated imagery.
