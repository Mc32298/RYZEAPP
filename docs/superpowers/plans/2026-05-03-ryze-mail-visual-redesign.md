# RYZE Mail Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the working RYZE Mail Electron/React client to match the approved RYZE Mail desktop design system without changing mail behavior.

**Architecture:** Keep `EmailClient.tsx` as the state/action coordinator and restyle the existing component tree in place. Add the RYZE token layer globally, map the existing theme setting onto those tokens, then update each visible email surface to the fixed 44px top bar, 240px sidebar, 360px list, flexible reader, and 24px status bar model.

**Tech Stack:** Electron, Vite, React 18, TypeScript, Tailwind CSS, lucide-react, Framer Motion, Radix UI, Vitest.

---

## File Structure

- Modify `C:\Users\MathiasNielsen-SPINO\Downloads\RYZEAPP\src\index.css`: import Poppins and JetBrains Mono, add RYZE tokens, add utility classes for token fonts, remove product-level gradient/glass/luxury defaults from email UI.
- Modify `C:\Users\MathiasNielsen-SPINO\Downloads\RYZEAPP\src\components\email\emailPreferences.ts`: update theme palette values to match RYZE dark/light tokens while preserving `themeMode` values and stored settings compatibility.
- Modify `C:\Users\MathiasNielsen-SPINO\Downloads\RYZEAPP\src\components\email\EmailClient.tsx`: replace root flex shell with fixed app grid, expose top bar/status bar, map theme mode to `data-theme`, remove floating shortcut bar styling, clean tutorial and lock overlay copy/styling.
- Modify `C:\Users\MathiasNielsen-SPINO\Downloads\RYZEAPP\src\components\email\Sidebar.tsx`: restyle sidebar rows, compose button, sections, account switcher, labels, and folder drag targets.
- Modify `C:\Users\MathiasNielsen-SPINO\Downloads\RYZEAPP\src\components\email\MessageList.tsx`: restyle search, filters, rows, tags, empty state, hover actions, and bulk toolbar.
- Modify `C:\Users\MathiasNielsen-SPINO\Downloads\RYZEAPP\src\components\email\ReadingPane.tsx`: restyle toolbar, empty state, thread content, labels, attachment blocks, remote image warning, and action buttons.
- Modify `C:\Users\MathiasNielsen-SPINO\Downloads\RYZEAPP\src\components\email\ConversationMessageCard.tsx`: align collapsed thread cards with the reader treatment.
- Modify `C:\Users\MathiasNielsen-SPINO\Downloads\RYZEAPP\src\components\email\ComposeDrawer.tsx`: restyle floating compose with RYZE surfaces and copy.
- Modify `C:\Users\MathiasNielsen-SPINO\Downloads\RYZEAPP\src\components\email\SettingsModal.tsx`: restyle modal, settings sections, fields, tabs, account cards, and Microsoft connection surface.
- Modify `C:\Users\MathiasNielsen-SPINO\Downloads\RYZEAPP\src\components\email\CalendarSidebar.tsx`: restyle as a utility panel in the same token system.
- Modify `C:\Users\MathiasNielsen-SPINO\Downloads\RYZEAPP\src\components\email\ReadingInsightsRail.tsx`: restyle as a restrained utility rail using flat surfaces.

## Task 1: Token Layer And Theme Mapping

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/email/emailPreferences.ts`

- [ ] **Step 1: Update global font imports and RYZE tokens**

In `src/index.css`, replace the current Google font import with:

```css
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap");
```

Inside `@layer base { :root { ... } }`, add the RYZE token variables after the existing shadcn variables:

```css
    --bg-0: oklch(0.16 0.008 60);
    --bg-1: oklch(0.19 0.009 60);
    --bg-2: oklch(0.22 0.010 60);
    --bg-3: oklch(0.27 0.012 60);
    --bg-4: oklch(0.32 0.014 60);
    --fg-0: oklch(0.97 0.010 80);
    --fg-1: oklch(0.82 0.012 75);
    --fg-2: oklch(0.62 0.012 70);
    --fg-3: oklch(0.45 0.010 65);
    --border-0: oklch(0.28 0.010 60);
    --border-1: oklch(0.35 0.012 60);
    --border-subtle: oklch(0.23 0.009 60);
    --ryze-accent: oklch(0.72 0.18 45);
    --ryze-accent-hover: oklch(0.76 0.18 45);
    --ryze-accent-active: oklch(0.68 0.18 45);
    --ryze-accent-soft: oklch(0.72 0.18 45 / 0.12);
    --ryze-accent-fg: oklch(0.16 0.008 60);
    --success-token: oklch(0.74 0.14 145);
    --warning-token: oklch(0.80 0.14 80);
    --danger-token: oklch(0.65 0.20 25);
    --info-token: oklch(0.72 0.10 220);
    --success-soft-token: oklch(0.74 0.14 145 / 0.14);
    --warning-soft-token: oklch(0.80 0.14 80 / 0.14);
    --danger-soft-token: oklch(0.65 0.20 25 / 0.14);
    --info-soft-token: oklch(0.72 0.10 220 / 0.14);
    --font-sans: "Poppins", system-ui, -apple-system, sans-serif;
    --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
    --sidebar-w: 240px;
    --list-w: 360px;
    --topbar-h: 44px;
    --statusbar-h: 24px;
    --radius-ryze-xs: 3px;
    --radius-ryze-sm: 5px;
    --radius-ryze-md: 7px;
```

- [ ] **Step 2: Add light token override**

Still in `src/index.css`, after the `.dark { ... }` block, add:

```css
  [data-theme="light"] {
    --bg-0: oklch(0.985 0.005 80);
    --bg-1: oklch(0.97 0.008 80);
    --bg-2: oklch(0.945 0.010 78);
    --bg-3: oklch(0.91 0.012 78);
    --bg-4: oklch(0.86 0.014 75);
    --fg-0: oklch(0.20 0.008 60);
    --fg-1: oklch(0.36 0.010 60);
    --fg-2: oklch(0.52 0.010 60);
    --fg-3: oklch(0.68 0.008 60);
    --border-0: oklch(0.88 0.010 78);
    --border-1: oklch(0.80 0.012 78);
    --border-subtle: oklch(0.93 0.008 78);
    --ryze-accent: oklch(0.62 0.18 45);
    --ryze-accent-hover: oklch(0.58 0.18 45);
    --ryze-accent-active: oklch(0.55 0.18 45);
    --ryze-accent-soft: oklch(0.62 0.18 45 / 0.10);
    --ryze-accent-fg: oklch(0.99 0 0);
  }
```

- [ ] **Step 3: Replace body font and product background**

In `src/index.css`, replace the current `body` font and background-image declarations with:

```css
    font-family: var(--font-sans);
    background-image: none;
```

Keep the existing smoothing and text rendering declarations.

- [ ] **Step 4: Replace font utilities and remove product glass utilities**

In `src/index.css`, keep `.font-mono-jetbrains`, but change utilities to:

```css
  .font-poppins {
    font-family: var(--font-sans);
  }
  .font-mono-jetbrains {
    font-family: var(--font-mono);
  }
  .ryze-transition {
    transition:
      background-color 180ms cubic-bezier(0.22, 1, 0.36, 1),
      color 180ms cubic-bezier(0.22, 1, 0.36, 1),
      border-color 180ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 180ms cubic-bezier(0.22, 1, 0.36, 1);
  }
```

Remove usage targets for `.font-fraunces`, `.font-space-grotesk`, `.glass-panel`, `.luxury-transition`, and `.luxury-hover` from email components in later tasks. The classes may remain temporarily in CSS until all component edits are complete, but no email UI should depend on them at the end.

- [ ] **Step 5: Map `EMAIL_THEMES` to RYZE-compatible values**

In `src/components/email/emailPreferences.ts`, replace `EMAIL_THEMES` values with this shape while preserving keys:

```ts
export const EMAIL_THEMES: Record<'obsidian' | 'linen' | 'systemDark' | 'systemLight', EmailTheme> = {
  obsidian: {
    background: 'var(--bg-0)',
    panel: 'var(--bg-1)',
    surface: 'var(--bg-2)',
    surfaceAlt: 'var(--bg-3)',
    border: 'var(--border-subtle)',
    borderStrong: 'var(--border-0)',
    hover: 'var(--bg-3)',
    input: 'var(--bg-2)',
    text: 'var(--fg-1)',
    textStrong: 'var(--fg-0)',
    textMuted: 'var(--fg-2)',
    textDim: 'var(--fg-3)',
    accent: 'var(--ryze-accent)',
    accentSoft: 'var(--ryze-accent-soft)',
    accentBorder: 'var(--ryze-accent)',
    accentContrast: 'var(--ryze-accent-fg)',
    danger: 'var(--danger-token)',
    shadow: 'oklch(0 0 0 / 0.6)',
  },
  linen: {
    background: 'var(--bg-0)',
    panel: 'var(--bg-1)',
    surface: 'var(--bg-2)',
    surfaceAlt: 'var(--bg-3)',
    border: 'var(--border-subtle)',
    borderStrong: 'var(--border-0)',
    hover: 'var(--bg-3)',
    input: 'var(--bg-2)',
    text: 'var(--fg-1)',
    textStrong: 'var(--fg-0)',
    textMuted: 'var(--fg-2)',
    textDim: 'var(--fg-3)',
    accent: 'var(--ryze-accent)',
    accentSoft: 'var(--ryze-accent-soft)',
    accentBorder: 'var(--ryze-accent)',
    accentContrast: 'var(--ryze-accent-fg)',
    danger: 'var(--danger-token)',
    shadow: 'oklch(0 0 0 / 0.18)',
  },
  systemDark: {
    background: 'var(--bg-0)',
    panel: 'var(--bg-1)',
    surface: 'var(--bg-2)',
    surfaceAlt: 'var(--bg-3)',
    border: 'var(--border-subtle)',
    borderStrong: 'var(--border-0)',
    hover: 'var(--bg-3)',
    input: 'var(--bg-2)',
    text: 'var(--fg-1)',
    textStrong: 'var(--fg-0)',
    textMuted: 'var(--fg-2)',
    textDim: 'var(--fg-3)',
    accent: 'var(--ryze-accent)',
    accentSoft: 'var(--ryze-accent-soft)',
    accentBorder: 'var(--ryze-accent)',
    accentContrast: 'var(--ryze-accent-fg)',
    danger: 'var(--danger-token)',
    shadow: 'oklch(0 0 0 / 0.6)',
  },
  systemLight: {
    background: 'var(--bg-0)',
    panel: 'var(--bg-1)',
    surface: 'var(--bg-2)',
    surfaceAlt: 'var(--bg-3)',
    border: 'var(--border-subtle)',
    borderStrong: 'var(--border-0)',
    hover: 'var(--bg-3)',
    input: 'var(--bg-2)',
    text: 'var(--fg-1)',
    textStrong: 'var(--fg-0)',
    textMuted: 'var(--fg-2)',
    textDim: 'var(--fg-3)',
    accent: 'var(--ryze-accent)',
    accentSoft: 'var(--ryze-accent-soft)',
    accentBorder: 'var(--ryze-accent)',
    accentContrast: 'var(--ryze-accent-fg)',
    danger: 'var(--danger-token)',
    shadow: 'oklch(0 0 0 / 0.18)',
  },
};
```

- [ ] **Step 6: Run type check**

Run:

```powershell
npm run lint
```

Expected: TypeScript completes with no new errors.

Commit if this workspace is initialized as a git repo:

```powershell
git add src/index.css src/components/email/emailPreferences.ts
git commit -m "feat: add ryze mail design tokens"
```

## Task 2: App Shell, Top Bar, Status Bar, Tutorial, And Lock Overlay

**Files:**
- Modify: `src/components/email/EmailClient.tsx`

- [ ] **Step 1: Add small shell helper functions near `getTheme`**

Add:

```ts
function getThemeAttribute(settings: EmailSettings, prefersDark: boolean) {
  if (settings.themeMode === "system") {
    return prefersDark ? "dark" : "light";
  }

  return settings.themeMode === "linen" ? "light" : "dark";
}

function formatSyncStatus(lastSyncedAt: Date | null) {
  if (!lastSyncedAt) return "Not synced";

  return `Synced ${lastSyncedAt.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
```

- [ ] **Step 2: Update theme mode detection**

Replace:

```ts
  const isAppDarkMode =
    theme.background === "#1A1814" || theme.background === "#15181E";
```

with:

```ts
  const themeAttribute = getThemeAttribute(settings, prefersDark);
  const isAppDarkMode = themeAttribute === "dark";
```

- [ ] **Step 3: Update `appStyle`**

Replace `fontFamily: "'Space Grotesk', sans-serif",` with:

```ts
    fontFamily: "var(--font-sans)",
```

Keep the existing `--email-*` compatibility variables for this pass.

- [ ] **Step 4: Replace the root shell class**

Change the root `<div>` opening to include `data-theme` and use grid shell classes:

```tsx
    <div
      data-theme={themeAttribute}
      className="grid h-full min-h-0 w-full select-none overflow-hidden bg-[var(--bg-0)] text-[var(--fg-0)]"
      style={{
        ...appStyle,
        gridTemplateRows: "var(--topbar-h) minmax(0,1fr) var(--statusbar-h)",
      }}
    >
```

- [ ] **Step 5: Add the 44px top bar before the main panes**

Immediately after the tutorial/settings overlays, add:

```tsx
      <div
        className="grid border-b border-[var(--border-subtle)] bg-[var(--bg-1)]"
        style={{ gridTemplateColumns: "var(--sidebar-w) var(--list-w) minmax(0,1fr)" }}
      >
        <div className="flex items-center gap-2 px-3">
          <div className="text-sm font-semibold tracking-normal text-[var(--fg-0)]">
            RYZE
          </div>
          <span className="h-1.5 w-1.5 rounded-[2px] bg-[var(--ryze-accent)]" />
        </div>
        <div className="flex items-center px-3">
          <div className="flex h-7 flex-1 items-center gap-2 rounded-[6px] border border-[var(--border-0)] bg-[var(--bg-2)] px-2.5 font-mono-jetbrains text-[12px] text-[var(--fg-2)]">
            <span className="truncate">{searchQuery || "Search mail"}</span>
            <kbd className="ml-auto rounded-[4px] border border-[var(--border-0)] bg-[var(--bg-1)] px-1.5 py-px text-[10px] text-[var(--fg-3)]">
              Ctrl K
            </kbd>
          </div>
        </div>
        <div className="flex min-w-0 items-center justify-end gap-2 px-3 font-mono-jetbrains text-[11px] text-[var(--fg-2)]">
          <span className="truncate">{currentAccount.email}</span>
          <span className="text-[var(--fg-3)]">/</span>
          <span className="text-[var(--fg-1)]">{formatSyncStatus(lastSyncedAt)}</span>
        </div>
      </div>
```

- [ ] **Step 6: Wrap the existing three panes in body grid**

Wrap the `Sidebar`, `MessageList`, `ReadingPane`, `CalendarSidebar`, and `ComposeDrawer` area in:

```tsx
      <div
        className="grid min-h-0 overflow-hidden"
        style={{ gridTemplateColumns: "var(--sidebar-w) var(--list-w) minmax(0,1fr)" }}
      >
        {/* existing Sidebar motion.div */}
        {/* existing MessageList motion.div */}
        {/* existing ReadingPane motion.div */}
      </div>
```

Keep `CalendarSidebar` and `ComposeDrawer` as children after this body grid so their fixed positioning continues to work.

- [ ] **Step 7: Replace floating shortcut bar with status bar**

Remove the fixed `bottom-3 left-1/2` shortcut block and add this as the final child before the session lock overlay:

```tsx
      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 font-mono-jetbrains text-[11px] text-[var(--fg-2)]">
        <span>Local database · {emails.length} messages</span>
        <span>
          C compose · R reply · T calendar · Arrow keys navigate
        </span>
      </div>
```

- [ ] **Step 8: Clean tutorial copy**

Replace tutorial strings:

```tsx
"Welcome to RYZE"
"Your inbox is yours. Connect an account to start reading mail locally."
"Continue"
"Account connected"
"You can right-click folders and labels to rename, empty, or delete them."
"Good to know"
"Learn the basics"
"Review compose and folder controls, or enter your inbox now."
"Show me"
"Enter inbox"
"Compose and folders"
"Press C to compose. Use the folder and label section controls to organize mail."
"Next"
"You're all set"
"RYZE Mail is ready."
```

Remove phrases with exclamation marks, "Awesome", "powerhouse", and "Thank you for choosing us".

- [ ] **Step 9: Restyle tutorial and lock overlay containers**

Replace tutorial modal classes containing `font-fraunces`, `font-space-grotesk`, `rounded-full`, `shadow-2xl`, and `hover:scale` with token classes:

```tsx
className={cn(
  "relative flex w-full max-w-[360px] flex-col overflow-hidden rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] p-8 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]",
  alignClass,
)}
```

For the session lock card, use:

```tsx
<div className="w-[320px] rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] p-6 text-center shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]">
```

- [ ] **Step 10: Run type check**

Run:

```powershell
npm run lint
```

Expected: TypeScript completes with no new errors.

Commit if available:

```powershell
git add src/components/email/EmailClient.tsx
git commit -m "feat: add ryze mail app shell"
```

## Task 3: Sidebar Restyle

**Files:**
- Modify: `src/components/email/Sidebar.tsx`

- [ ] **Step 1: Replace sidebar width/background classes**

In the exported `Sidebar` root, use fixed width from the shell:

```tsx
className={cn(
  "flex h-full min-h-0 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-1)] px-2 py-2 text-[var(--fg-1)]",
  isCollapsed ? "w-[72px]" : "w-[var(--sidebar-w)]",
)}
```

- [ ] **Step 2: Restyle compose button**

Use:

```tsx
className="mb-3 flex h-8 w-full items-center justify-center gap-2 rounded-[var(--radius-ryze-md)] bg-[var(--ryze-accent)] px-3 text-[13px] font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]"
```

- [ ] **Step 3: Restyle section labels**

Replace uppercase Space Grotesk labels with:

```tsx
className="px-2.5 pb-1.5 pt-3 font-mono-jetbrains text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--fg-3)]"
```

- [ ] **Step 4: Restyle folder rows**

For folder row buttons, use this active/inactive class pattern:

```tsx
className={cn(
  "flex w-full items-center justify-between rounded-[6px] border-l-2 py-1.5 pr-2.5 text-[13px] transition-colors",
  isDragOver
    ? "border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] text-[var(--fg-0)]"
    : isActive
      ? "border-[var(--ryze-accent)] bg-[var(--bg-3)] font-medium text-[var(--fg-0)]"
      : "border-transparent text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]",
)}
```

Keep the existing `style={{ paddingLeft: ... }}` so nested folders still indent.

- [ ] **Step 5: Restyle count badges**

Use mono and no pill:

```tsx
className={cn(
  "ml-2 shrink-0 font-mono-jetbrains text-[10.5px] font-medium",
  isActive ? "text-[var(--fg-1)]" : "text-[var(--fg-2)]",
)}
```

- [ ] **Step 6: Run sidebar drag/drop test**

Run:

```powershell
npx vitest run src/components/email/sidebarDragDrop.test.ts
```

Expected: all tests pass.

Commit if available:

```powershell
git add src/components/email/Sidebar.tsx
git commit -m "feat: restyle mail sidebar"
```

## Task 4: Message List Restyle

**Files:**
- Modify: `src/components/email/MessageList.tsx`

- [ ] **Step 1: Restyle list container and header**

Use a fixed-width list shell:

```tsx
className="flex h-full min-h-0 w-[var(--list-w)] flex-col overflow-hidden border-r border-[var(--border-subtle)] bg-[var(--bg-0)]"
```

Use header classes:

```tsx
className="border-b border-[var(--border-subtle)] px-4 py-3"
```

For title:

```tsx
className="text-[18px] font-semibold tracking-normal text-[var(--fg-0)]"
```

- [ ] **Step 2: Restyle search input**

Use:

```tsx
className="flex h-8 items-center gap-2 rounded-[6px] border border-[var(--border-0)] bg-[var(--bg-2)] px-2.5 text-[13px] text-[var(--fg-1)] transition-colors focus-within:border-[var(--border-1)]"
```

Input:

```tsx
className="min-w-0 flex-1 bg-transparent font-poppins text-[13px] text-[var(--fg-0)] outline-none placeholder:text-[var(--fg-3)]"
```

- [ ] **Step 3: Restyle message row**

For `MessageRow`, set selected/unselected classes:

```tsx
className={cn(
  "relative cursor-pointer border-b border-[var(--border-subtle)] px-3.5 transition-colors",
  density === "compact" ? "py-2.5" : "py-3",
  isSelected ? "bg-[var(--bg-2)]" : "hover:bg-[var(--bg-1)]",
)}
style={{
  paddingLeft: row.hasUnread || isSelected ? "14px" : "16px",
  borderLeft:
    row.hasUnread || isSelected
      ? "2px solid var(--ryze-accent)"
      : "2px solid transparent",
}}
```

- [ ] **Step 4: Restyle row typography**

Sender:

```tsx
className={cn(
  "truncate text-[13.5px]",
  row.hasUnread ? "font-semibold text-[var(--fg-0)]" : "font-medium text-[var(--fg-1)]",
  isSelected && "text-[var(--fg-0)]",
)}
```

Timestamp:

```tsx
className="font-mono-jetbrains text-[10.5px] text-[var(--fg-2)]"
```

Subject:

```tsx
className={cn(
  "truncate text-[13px]",
  row.hasUnread ? "font-medium text-[var(--fg-0)]" : "text-[var(--fg-1)]",
)}
```

Preview:

```tsx
className="truncate text-[12.5px] leading-relaxed text-[var(--fg-2)]"
```

- [ ] **Step 5: Restyle bulk toolbar**

Replace `glass-panel` toolbar classes with:

```tsx
className="absolute left-3 right-3 top-3 z-20 flex items-center gap-2 rounded-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] px-3 py-2 shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]"
```

- [ ] **Step 6: Run thread view tests**

Run:

```powershell
npm run test:thread-view
```

Expected: all tests pass.

Commit if available:

```powershell
git add src/components/email/MessageList.tsx
git commit -m "feat: restyle message list"
```

## Task 5: Reading Pane And Conversation Cards

**Files:**
- Modify: `src/components/email/ReadingPane.tsx`
- Modify: `src/components/email/ConversationMessageCard.tsx`

- [ ] **Step 1: Restyle `ActionButton`**

Replace its class with:

```tsx
className={cn(
  "flex h-7 items-center gap-1.5 rounded-[6px] px-2.5 text-[12px] font-medium transition-colors",
  variant === "danger"
    ? "text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--danger-token)]"
    : "text-[var(--fg-1)] hover:bg-[var(--bg-2)] hover:text-[var(--fg-0)]",
)}
```

- [ ] **Step 2: Restyle empty state**

Use:

```tsx
<div className="flex h-full min-h-0 flex-1 items-center justify-center bg-[var(--bg-0)] text-center">
  <div className="max-w-[320px] px-6">
    <p className="text-[17px] font-medium text-[var(--fg-0)]">Your inbox is yours</p>
    <p className="mt-2 text-[13px] leading-relaxed text-[var(--fg-2)]">
      Select a message to read it locally.
    </p>
  </div>
</div>
```

- [ ] **Step 3: Restyle reader root and toolbar**

Use root:

```tsx
className="flex h-full min-h-0 flex-1 overflow-hidden bg-[var(--bg-0)]"
```

Toolbar:

```tsx
className="flex h-11 shrink-0 items-center gap-1 border-b border-[var(--border-subtle)] bg-[var(--bg-0)] px-4"
```

- [ ] **Step 4: Restyle thread content**

Use scroll/content classes:

```tsx
className="min-h-0 flex-1 overflow-y-auto px-10 py-7 scrollbar-thin"
```

Thread wrapper:

```tsx
className="mx-auto max-w-[720px]"
```

Subject:

```tsx
className="mb-5 text-[24px] font-semibold leading-tight tracking-normal text-[var(--fg-0)]"
```

- [ ] **Step 5: Restyle remote image and attachment notices**

Use:

```tsx
className="mb-4 rounded-[var(--radius-ryze-md)] border border-[var(--border-0)] bg-[var(--bg-1)] px-4 py-3 text-[13px] text-[var(--fg-2)]"
```

- [ ] **Step 6: Restyle `ConversationMessageCard`**

Use collapsed card root:

```tsx
className="rounded-[var(--radius-ryze-md)] border border-[var(--border-subtle)] bg-[var(--bg-1)] px-3 py-2 transition-colors hover:bg-[var(--bg-2)]"
```

Replace `font-space-grotesk` with default Poppins and `font-mono-jetbrains` for metadata only.

- [ ] **Step 7: Run rendering tests**

Run:

```powershell
npm run test:thread-view
npx vitest run src/components/email/threadMessageRendering.test.ts
```

Expected: all tests pass.

Commit if available:

```powershell
git add src/components/email/ReadingPane.tsx src/components/email/ConversationMessageCard.tsx
git commit -m "feat: restyle reading pane"
```

## Task 6: Compose Window

**Files:**
- Modify: `src/components/email/ComposeDrawer.tsx`

- [ ] **Step 1: Restyle compose card root**

Replace spring transition with a restrained ease:

```tsx
transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
```

Use root class:

```tsx
className={cn(
  "flex flex-col overflow-hidden rounded-t-[var(--radius-ryze-lg)] border border-[var(--border-1)] bg-[var(--bg-2)] shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]",
  draft.isFullscreen ? "fixed inset-4 z-50" : "h-[520px] w-[480px]",
)}
```

- [ ] **Step 2: Restyle compose header**

Use:

```tsx
className="flex shrink-0 cursor-move select-none items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-3"
```

Subject title:

```tsx
className="block truncate text-[13px] font-medium text-[var(--fg-1)]"
```

- [ ] **Step 3: Restyle compose fields**

Label:

```tsx
className="w-7 shrink-0 text-[12px] text-[var(--fg-2)]"
```

Input:

```tsx
className="flex-1 bg-transparent text-[13px] text-[var(--fg-0)] outline-none placeholder:text-[var(--fg-3)]"
```

- [ ] **Step 4: Restyle editor and footer**

Editor:

```tsx
className="compose-html-editor flex-1 overflow-y-auto bg-transparent p-4 text-[14px] leading-relaxed text-[var(--fg-0)] outline-none scrollbar-thin empty:before:pointer-events-none empty:before:text-[var(--fg-3)] empty:before:content-[attr(data-placeholder)]"
```

Footer buttons:

```tsx
className="flex h-8 items-center gap-2 rounded-[var(--radius-ryze-md)] bg-[var(--ryze-accent)] px-3 text-[13px] font-medium text-[var(--ryze-accent-fg)] transition-colors hover:bg-[var(--ryze-accent-hover)]"
```

- [ ] **Step 5: Run type check**

Run:

```powershell
npm run lint
```

Expected: TypeScript completes with no new errors.

Commit if available:

```powershell
git add src/components/email/ComposeDrawer.tsx
git commit -m "feat: restyle compose window"
```

## Task 7: Settings Modal

**Files:**
- Modify: `src/components/email/SettingsModal.tsx`

- [ ] **Step 1: Restyle `SettingsSection`**

Use:

```tsx
<div className="border-b border-[var(--border-subtle)] py-5 last:border-b-0">
  <h4 className="text-[17px] font-medium text-[var(--fg-0)]">{title}</h4>
  <p className="mt-1 text-[12px] leading-relaxed text-[var(--fg-2)]">{description}</p>
  <div className="mt-4">{children}</div>
</div>
```

- [ ] **Step 2: Restyle modal shell**

Use dialog/card classes:

```tsx
className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-6 backdrop-blur-sm"
```

Panel:

```tsx
className="flex h-[min(760px,calc(100vh-48px))] w-[min(960px,calc(100vw-48px))] overflow-hidden rounded-[var(--radius-ryze-xl)] border border-[var(--border-1)] bg-[var(--bg-2)] shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]"
```

- [ ] **Step 3: Restyle fields**

Input/select/textarea class:

```tsx
className="w-full rounded-[var(--radius-ryze-md)] border border-[var(--border-0)] bg-[var(--bg-1)] px-3 py-2 text-[13px] text-[var(--fg-0)] outline-none transition-colors placeholder:text-[var(--fg-3)] focus:border-[var(--ryze-accent)]"
```

- [ ] **Step 4: Restyle theme setting labels without changing values**

Keep values `obsidian`, `linen`, and `system`, but change visible labels to:

```ts
const themeLabels: Record<EmailSettings["themeMode"], string> = {
  obsidian: "Dark",
  linen: "Light",
  system: "System",
};
```

- [ ] **Step 5: Run type check**

Run:

```powershell
npm run lint
```

Expected: TypeScript completes with no new errors.

Commit if available:

```powershell
git add src/components/email/SettingsModal.tsx
git commit -m "feat: restyle settings modal"
```

## Task 8: Calendar Sidebar And AI Insights Rail

**Files:**
- Modify: `src/components/email/CalendarSidebar.tsx`
- Modify: `src/components/email/ReadingInsightsRail.tsx`

- [ ] **Step 1: Restyle calendar panel root**

Use:

```tsx
className={cn(
  "fixed right-0 top-[var(--topbar-h)] z-30 h-[calc(100vh-var(--topbar-h)-var(--statusbar-h))] w-[340px] border-l border-[var(--border-subtle)] bg-[var(--bg-1)] text-[var(--fg-1)] shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]",
  isOpen ? "translate-x-0" : "translate-x-full",
)}
```

- [ ] **Step 2: Restyle event cards**

Use:

```tsx
className="rounded-[var(--radius-ryze-md)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-3"
```

Title:

```tsx
className="text-[13px] font-medium leading-snug text-[var(--fg-0)]"
```

Time:

```tsx
className="mt-2 font-mono-jetbrains text-[11px] text-[var(--fg-2)]"
```

- [ ] **Step 3: Restyle insights rail root**

Use:

```tsx
className="w-[280px] shrink-0 border-l border-[var(--border-subtle)] bg-[var(--bg-1)] px-4 py-4 text-[var(--fg-1)]"
```

- [ ] **Step 4: Restyle insight cards and tone buttons**

Card:

```tsx
className="rounded-[var(--radius-ryze-md)] border border-[var(--border-subtle)] bg-[var(--bg-2)] px-3 py-3"
```

Tone button:

```tsx
className={cn(
  "rounded-[var(--radius-ryze-sm)] border px-2.5 py-1.5 text-[12px] transition-colors",
  selectedTone === tone
    ? "border-[var(--ryze-accent)] bg-[var(--ryze-accent-soft)] text-[var(--ryze-accent)]"
    : "border-[var(--border-0)] bg-[var(--bg-1)] text-[var(--fg-2)] hover:bg-[var(--bg-3)] hover:text-[var(--fg-0)]",
)}
```

- [ ] **Step 5: Run insights tests**

Run:

```powershell
npm run test:email-insights
```

Expected: all tests pass.

Commit if available:

```powershell
git add src/components/email/CalendarSidebar.tsx src/components/email/ReadingInsightsRail.tsx
git commit -m "feat: restyle utility panels"
```

## Task 9: Cleanup Old Visual Language

**Files:**
- Modify: `src/index.css`
- Modify: all files under `src/components/email`

- [ ] **Step 1: Search for old visual classes**

Run:

```powershell
rg "font-fraunces|font-space-grotesk|glass-panel|luxury-transition|luxury-hover|hover:scale|shadow-2xl|rounded-full" src/components/email src/index.css
```

Expected: remaining matches are only legitimate avatar circles or non-email legacy CSS utilities. Email chrome should not use Fraunces, Space Grotesk, glass, luxury, hover scale, or broad card shadows.

- [ ] **Step 2: Replace remaining email chrome typography**

For email UI copy, replace:

```tsx
"font-space-grotesk"
```

with no font class, because the root uses Poppins.

For metadata, keep:

```tsx
"font-mono-jetbrains"
```

For old headings, replace:

```tsx
"font-fraunces"
```

with:

```tsx
"font-medium"
```

- [ ] **Step 3: Replace hover scale and broad shadow**

Replace:

```tsx
"transition-transform hover:scale-[1.02]"
"shadow-2xl"
```

with:

```tsx
"transition-colors"
"shadow-[0_16px_48px_-12px_oklch(0_0_0_/_0.6)]"
```

Use the shadow only for modal, popover, dropdown, calendar drawer, and compose surfaces.

- [ ] **Step 4: Run final old-style search**

Run:

```powershell
rg "font-fraunces|font-space-grotesk|glass-panel|luxury-transition|luxury-hover|hover:scale" src/components/email
```

Expected: no matches.

Commit if available:

```powershell
git add src/index.css src/components/email
git commit -m "chore: remove old mail visual language"
```

## Task 10: Verification And Visual Review

**Files:**
- No planned code edits.

- [ ] **Step 1: Run full TypeScript check**

Run:

```powershell
npm run lint
```

Expected: TypeScript completes with no errors.

- [ ] **Step 2: Run focused behavior tests**

Run:

```powershell
npm run test:thread-view
npm run test:email-insights
npx vitest run src/components/email/threadMessageRendering.test.ts src/components/email/sidebarDragDrop.test.ts
```

Expected: all tests pass.

- [ ] **Step 3: Build**

Run:

```powershell
npm run build
```

Expected: TypeScript and Vite build complete.

- [ ] **Step 4: Start local dev server**

Run:

```powershell
npm run dev -- --host 127.0.0.1
```

Expected: Vite starts and prints a local URL, typically `http://127.0.0.1:5173/`.

- [ ] **Step 5: Visual state checklist**

In the app, inspect:

```text
Dark mode inbox with selected thread
Light mode inbox with selected thread
No selected message state
Empty folder state
Compose window
Settings modal
Calendar sidebar
AI insights rail
Bulk selection toolbar
Tutorial overlay
Session lock overlay
Folder and label context menus
```

Expected: all visible email surfaces use the RYZE token system, fixed shell proportions, flat surfaces, hairline borders, Poppins/JetBrains Mono, and no product UI gradients/glass/luxury styling.

- [ ] **Step 6: Final behavior smoke test**

Manually confirm:

```text
Selecting a folder updates the list.
Selecting a message updates the reader.
Search input filters messages.
Compose opens, edits, minimizes, restores, fullscreens, and closes.
Reply and forward still open drafts.
Settings open and close.
Theme setting changes visual mode.
Calendar shortcut T opens calendar.
Arrow keys move selection.
```

Expected: behavior matches the pre-redesign app.

Commit if available:

```powershell
git add src docs/superpowers
git commit -m "feat: complete ryze mail visual redesign"
```

## Self-Review

- Spec coverage: covered token layer, fixed shell, all visible email surfaces, theme mode, copy cleanup, no behavior changes, and verification.
- Placeholder scan: no open placeholders or unresolved questions.
- Type consistency: existing `EmailSettings`, `ThemeMode`, and component prop contracts are preserved. New helpers use existing `settings`, `prefersDark`, and `lastSyncedAt` values.
- Scope control: all new feature ideas are excluded. The plan only changes UI styling, shell layout, and copy.
