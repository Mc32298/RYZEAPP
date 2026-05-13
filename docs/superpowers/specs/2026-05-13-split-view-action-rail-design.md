# Design Spec: Split View & Smart Action Rail (AI-Powered)

**Date:** 2026-05-13
**Status:** Draft
**Feature:** Split View / Multi-tasking with AI-powered Smart Action Rail
**Goal:** Enhance RYZE Mail with an "Apple-like" multi-tasking experience that uses local AI to extract events and tasks from emails, displaying them in a companion side panel.

---

## 1. Overview
RYZE Mail aims to be more than just an email reader; it should be an intentional workspace. The "Split View" feature introduces a companion panel (starting with an expanded Calendar) that sits side-by-side with the email inbox. To make this interaction seamless, a "Smart Action Rail" uses the Gemini API to detect dates and events in emails, allowing users to "one-click" schedule them into their calendar.

---

## 2. Architecture & Data Flow

### 2.1 AI Extraction Pipeline
- **Trigger:** Opening an email in the `ReadingPane`.
- **Process:**
    1. The `ReadingPane` triggers a background IPC call to the Main process.
    2. The Main process checks the local SQLite cache for existing extractions.
    3. If none exist, it sends the sanitized text of the email to the Gemini API using the user's `GEMINI_API_KEY`.
    4. The model returns a structured JSON object containing detected events (start, end, title) and tasks.
    5. Results are saved to the `ai_extractions` table and sent back to the Renderer.
- **Privacy:** No data is stored on RYZE servers. All processing is direct between the client and Google's Gemini API.

### 2.2 Split View Orchestration
- **Layout:** A flexible grid/flex layout that expands to include the companion panel.
- **State:** Managed in `EmailClient.tsx`. Opening the calendar collapses the main sidebar to "Icon Only" mode to maximize horizontal space.

---

## 3. UI Components

### 3.1 `ReadingInsightsRail.tsx` (New)
- **Location:** Vertical bar (48px wide) between the `ReadingPane` and the `ExpandedCalendar`.
- **Aesthetic:** High-density, dark-first (Obsidian theme).
- **Interactions:**
    - **Pulsing Icons:** Indicate new AI-detected items.
    - **Click/Hover:** Highlights the corresponding time/date in the Expanded Calendar.

### 3.2 `ExpandedCalendar.tsx` (Enhanced)
- **Features:** 
    - Full-height agenda or day view.
    - "Proposed Event" state: A ghosted event block that appears when hovering a Magic Card in the rail.
    - One-click "SAVE" to commit the proposed event to the user's Microsoft/Google calendar.

---

## 4. Local Storage & Security

### 4.1 SQLite Schema
```sql
CREATE TABLE IF NOT EXISTS ai_extractions (
  messageId  TEXT NOT NULL,
  type       TEXT NOT NULL, -- 'event', 'task'
  content    TEXT NOT NULL, -- JSON data (start, end, title)
  createdAt  TEXT NOT NULL,
  PRIMARY KEY (messageId, type),
  FOREIGN KEY(messageId) REFERENCES emails(id) ON DELETE CASCADE
);
```

### 4.2 Security Mandates
- **Local-First:** All extraction results are stored only on the user's machine.
- **Auto-Cleanup:** `ON DELETE CASCADE` ensures that deleting an email also wipes its AI-generated metadata.
- **Credential Safety:** Gemini API keys are retrieved from `.env` and never logged or exposed to the renderer directly (handled in Main).

---

## 5. Success Criteria
1. Opening an email with a date (e.g., "Lunch tomorrow at 1pm") results in a calendar icon appearing in the Smart Rail within 2 seconds.
2. Clicking the rail icon opens the Split View (if closed) and scrolls the calendar to the correct time.
3. Users can save the proposed event with a single click.
4. The main sidebar collapses/expands smoothly without layout thrashing.
5. All AI processing honors the "Security First" and "No Telemetry" project mandates.
