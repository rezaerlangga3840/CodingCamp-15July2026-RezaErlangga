# Implementation Plan: To-Do List Life Dashboard

## Overview

Build a zero-dependency, single-page web app using HTML, CSS, and Vanilla JavaScript. The implementation proceeds widget by widget, wiring each one to LocalStorage as it's built. The file structure is fixed: `index.html`, `css/style.css`, `js/app.js`.

## Tasks

- [ ] 1. Scaffold project structure and base HTML
  - Create `index.html` at project root with semantic HTML5 boilerplate
  - Create `css/style.css` with empty ruleset
  - Create `js/app.js` with empty IIFE wrapper
  - Link `css/style.css` and `js/app.js` in `index.html` using relative paths
  - Add placeholder sections for each widget: `#greeting`, `#timer`, `#todo`, `#quicklinks`, `#theme-toggle`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 2. Implement theme system (Light / Dark Mode)
  - [ ] 2.1 Implement `ThemeModule` in `app.js`
    - Write `loadTheme()` — reads `theme` key from `localStorage`, defaults to `"light"`
    - Write `saveTheme(theme)` — writes `theme` key to `localStorage`
    - Write `applyTheme(theme)` — toggles `dark` CSS class on `<body>`
    - Write `toggleTheme()` — flips current theme, calls `saveTheme` and `applyTheme`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ] 2.2 Add theme CSS custom properties in `style.css`
    - Define `:root` variables for light theme (background, text, surface, accent colors)
    - Define `body.dark` overrides for dark theme colors
    - Apply variables to all base elements so theme switch is instant
    - _Requirements: 5.2, 5.3_
  - [ ] 2.3 Add theme toggle button to `index.html` and wire it in `app.js`
    - Add a `<button id="theme-toggle">` with a sun/moon icon or label
    - On `DOMContentLoaded`, call `applyTheme(loadTheme())` and bind click → `toggleTheme()`
    - _Requirements: 5.1, 5.4, 5.5_

- [ ] 3. Implement Greeting Widget
  - [ ] 3.1 Implement `GreetingModule` pure functions in `app.js`
    - Write `getGreeting(hour, name)` — returns correct greeting string based on hour range
    - Write `formatDate(date)` — returns locale-formatted date string (e.g. "Wednesday, 16 July 2026")
    - Write `formatTime(date)` — returns HH:MM:SS string
    - Write `loadUserName()` — reads `userName` from `localStorage`, defaults to `"User"`
    - Write `saveUserName(name)` — writes `userName` to `localStorage`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  - [ ] 3.2 Add greeting HTML structure and wire to `app.js`
    - Add `<div id="greeting">` containing elements for time, date, and greeting text
    - Add an editable `<span>` or `<input>` for user name with a save/confirm interaction
    - On `DOMContentLoaded`, render greeting using stored name; start `setInterval` (1000ms) to update time/date/greeting
    - Bind name-edit confirm action → `saveUserName` + re-render
    - _Requirements: 1.1, 1.2, 1.6, 1.7, 1.8_

- [ ] 4. Implement Focus Timer (Pomodoro)
  - [ ] 4.1 Implement `TimerModule` in `app.js`
    - Write `formatTimerDisplay(totalSeconds)` — converts integer seconds to `"MM:SS"` string
    - Implement timer state object: `{ duration, remaining, intervalId, running }`
    - Write `startTimer()` — starts `setInterval` counting down `remaining` each second; stops and alerts at 0
    - Write `stopTimer()` — clears interval, sets `running = false`
    - Write `resetTimer()` — stops timer, restores `remaining` to `duration`
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6, 2.7_
  - [ ] 4.2 Add timer HTML structure and wire to `app.js`
    - Add `<div id="timer">` with display element, duration input, Start/Stop/Reset buttons
    - On `DOMContentLoaded`, initialize timer at 25 minutes (1500 seconds) and render display
    - Bind Start/Stop/Reset buttons to `TimerModule` functions
    - Bind duration input change → update `timer.duration` and call `resetTimer()`
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 5. Implement To-Do List
  - [ ] 5.1 Implement `TaskModule` pure/data functions in `app.js`
    - Write `loadTasks()` — JSON.parse from `localStorage` key `tasks`, defaults to `[]`, wraps in try/catch
    - Write `saveTasks(tasks)` — JSON.stringify and write to `localStorage` key `tasks`
    - Write `addTask(tasks, description)` — validates non-empty (trim), checks case-insensitive duplicate; returns `Result`
    - Write `deleteTask(tasks, id)` — returns filtered array
    - Write `editTask(tasks, id, newDesc)` — returns updated array with trimmed new description
    - Write `toggleTask(tasks, id)` — returns array with flipped `completed` for matching id
    - Write `sortTasks(tasks, criterion)` — sorts by `"status"` (incomplete first) or `"alpha"` (alphabetical by description)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_
  - [ ] 5.2 Write `renderTasks(tasks)` and wire task list HTML
    - Add `<section id="todo">` with add-task input, sort controls, and task list `<ul>`
    - Write `renderTasks(tasks)` — clears and rebuilds `<ul>` with task items (checkbox, description, edit button, delete button)
    - On `DOMContentLoaded`, call `loadTasks()` → `renderTasks()`
    - Bind add-task form submit: call `addTask`, show inline error if `result.ok === false`, else `saveTasks` + `renderTasks`
    - Bind task checkbox change → `toggleTask` → `saveTasks` → `renderTasks`
    - Bind task edit button → inline edit mode → on confirm `editTask` → `saveTasks` → `renderTasks`
    - Bind task delete button → `deleteTask` → `saveTasks` → `renderTasks`
    - Bind sort control change → `sortTasks` → `renderTasks` (re-sort from stored tasks)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [ ] 6. Checkpoint — Core widgets complete
  - Verify greeting, timer, and to-do list work end-to-end in browser
  - Verify localStorage persists tasks and theme across page reloads
  - Fix any integration issues before continuing

- [ ] 7. Implement Quick Links
  - [ ] 7.1 Implement `QuickLinksModule` in `app.js`
    - Write `isValidUrl(url)` — uses `new URL(url)` in try/catch; returns boolean
    - Write `loadLinks()` — JSON.parse from `localStorage` key `quickLinks`, defaults to `[]`, wraps in try/catch
    - Write `saveLinks(links)` — JSON.stringify and write to `localStorage` key `quickLinks`
    - Write `addLink(links, label, url)` — validates non-empty label and valid URL; returns `Result`
    - Write `deleteLink(links, id)` — returns filtered array
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [ ] 7.2 Write `renderLinks(links)` and wire quick links HTML
    - Add `<section id="quicklinks">` with label+URL inputs, add button, and links container
    - Write `renderLinks(links)` — clears and rebuilds link buttons (each opens URL in new tab) plus a delete icon
    - On `DOMContentLoaded`, call `loadLinks()` → `renderLinks()`
    - Bind add-link form submit: call `addLink`, show inline error if `result.ok === false`, else `saveLinks` + `renderLinks`
    - Bind delete icon on each link → `deleteLink` → `saveLinks` → `renderLinks`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 8. Complete CSS styling
  - [ ] 8.1 Style layout and grid
    - Style `body` as a responsive CSS Grid or Flexbox layout
    - Lay out widgets in a dashboard grid (2-column on desktop, single-column on mobile with media query)
    - Apply consistent spacing, border-radius, and card shadows to widget sections
    - _Requirements: NFR-2, NFR-3_
  - [ ] 8.2 Style individual widgets
    - Style greeting section: large clock font, subdued date, prominent greeting line
    - Style timer: large countdown display, row of control buttons with active/disabled states
    - Style to-do list: clean task rows, strikethrough on completed tasks, hover states on action buttons
    - Style quick links: pill/card buttons with hover effect
    - Style theme toggle button: fixed position or top-right placement, icon that reflects current theme
    - _Requirements: NFR-3, 3.4_
  - [ ] 8.3 Ensure accessibility basics
    - Add `aria-label` attributes to icon-only buttons
    - Ensure sufficient color contrast ratios in both light and dark themes
    - Use `:focus-visible` outlines for keyboard navigation
    - _Requirements: NFR-3_

- [ ] 9. Final wiring and polish
  - [ ] 9.1 Add LocalStorage error handling
    - Wrap all `localStorage` reads and writes in try/catch
    - If `localStorage` is unavailable, maintain in-memory state and show a non-blocking warning banner
    - _Requirements: TC-2_
  - [ ] 9.2 Final integration pass
    - Confirm all five widgets initialize correctly on a fresh load (no saved data)
    - Confirm all five widgets restore correctly on reload with saved data
    - Confirm app works when opened via `file://` protocol in Chrome, Firefox, and Edge
    - _Requirements: 6.5, TC-3_

- [ ] 10. Final checkpoint — All features complete
  - Open `index.html` directly in browser (file:// protocol)
  - Walk through every acceptance criterion: greeting, timer, tasks, quick links, theme toggle
  - Verify no console errors in any supported browser
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- The project has no test framework requirement — all correctness properties in design.md describe pure function behavior for future test adoption
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at meaningful milestones
