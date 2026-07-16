# Implementation Plan: Life Dashboard Rebuild

## Overview

Refactor the existing single flat `app.js` into a set of self-contained module objects, each owning its own private state, while keeping the identical HTML structure, CSS, localStorage keys, and user-facing behaviour. Pure helper functions are extracted into a separate `js/utils.js` file so they can be unit- and property-tested in isolation. No framework, no build step.

---

## Tasks

- [ ] 1. Extract pure utility functions into `js/utils.js`
  - Create `js/utils.js` and export the following pure functions: `pad(n)`, `formatClockTime(date)`, `formatDate(date)`, `getGreetingText(hour, name)`, `formatTimerDisplay(seconds)`, `clampDuration(raw)`
  - Each function must be a named export (or attached to a `Utils` object) so tests can import them
  - Add a `<script src="js/utils.js"></script>` tag before `js/app.js` in `index.html`
  - _Requirements: 2.1, 2.2, 3.1–3.6, 6.1, 6.10_

  - [ ]* 1.1 Write property test for `formatClockTime`
    - **Property 2: Clock time format correctness**
    - **Validates: Requirements 2.1**
    - Use `fc.date()` to generate random Dates; assert HH:MM:SS pattern and matching hour/minute/second values

  - [ ]* 1.2 Write property test for `formatDate`
    - **Property 3: Date format correctness**
    - **Validates: Requirements 2.2**
    - Use `fc.date()` to generate random Dates; assert day name, numeric day, month name, and year are all present and correct

  - [ ]* 1.3 Write property test for `getGreetingText` — phrase correctness
    - **Property 4: Greeting phrase correctness**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
    - Use `fc.integer({ min: 0, max: 23 })` to generate hours; assert the correct phrase per range

  - [ ]* 1.4 Write property test for `getGreetingText` — name inclusion
    - **Property 5: Greeting name inclusion**
    - **Validates: Requirements 3.5, 3.6**
    - Use `fc.integer({ min: 0, max: 23 })` × `fc.string({ minLength: 1 })` to assert name is appended; use empty string to assert no comma before "!"

  - [ ]* 1.5 Write property test for `formatTimerDisplay`
    - **Property 6: Timer display format correctness**
    - **Validates: Requirements 6.1**
    - Use `fc.integer({ min: 0, max: 7200 })` to generate seconds; assert MM:SS pattern and correct values

  - [ ]* 1.6 Write property test for `clampDuration`
    - **Property 7: Duration clamping**
    - **Validates: Requirements 6.10**
    - Use `fc.integer({ min: -1000, max: 1000 })` to generate inputs; assert result is always in [1, 120]

- [ ] 2. Implement the `Store` module
  - Write the Store as an IIFE at the top of `app.js` (or as a `const Store = { get, set }` object)
  - `get(key, fallback)`: wraps `localStorage.getItem` + `JSON.parse`, returns `fallback` on any error
  - `set(key, value)`: wraps `JSON.stringify` + `localStorage.setItem`, swallows errors silently
  - Remove all direct `localStorage` calls from the rest of the file; route everything through `Store`
  - _Requirements: 1.1, 1.2, 1.3_

  - [ ]* 2.1 Write property test for Store round-trip
    - **Property 1: Store round-trip**
    - **Validates: Requirements 1.1, 1.2**
    - Use `fc.jsonValue()` × `fc.string()` to generate arbitrary key/value pairs; assert `Store.get` after `Store.set` returns deeply equal value

- [-] 3. Checkpoint — Ensure all utility and Store tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [~] 4. Implement `ClockModule`
  - Create `ClockModule` as an IIFE with private `intervalHandle` and DOM refs
  - Expose `start()` (begins 1-second `setInterval`, calls `updateClock` immediately) and `updateGreeting(name)` (re-renders only the greeting text)
  - `updateClock()` calls `formatClockTime(new Date())`, `formatDate(new Date())`, and `getGreetingText(hour, Store.get('ld_name', ''))`
  - `start()` should be called once from `init()`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1–3.6_

- [ ] 5. Implement `ThemeModule`
  - Create `ThemeModule` as an IIFE
  - `init()` reads `Store.get('ld_theme', 'light')`, calls `applyTheme(theme)`, and binds the toggle button click listener
  - `applyTheme(theme)` sets `document.documentElement.setAttribute('data-theme', theme)`, updates the icon, and calls `Store.set`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.1 Write example tests for `ThemeModule`
    - Test: applying "dark" sets `data-theme="dark"` and icon is ☀️
    - Test: applying "light" sets `data-theme="light"` and icon is 🌙
    - Test: clicking toggle switches from light to dark and vice versa

- [ ] 6. Implement `NameModule`
  - Create `NameModule` as an IIFE
  - `init(clockModule)` renders the stored name (or "Set your name"), binds edit pencil button, Save button, Enter key, and Escape key
  - On save: trim input, `Store.set('ld_name', val)`, update display, call `clockModule.updateGreeting(val)`
  - On Escape: hide edit input, restore display without saving
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 6.1 Write example tests for `NameModule`
    - Test: clicking edit icon shows input pre-filled with current name
    - Test: submitting save persists name and hides edit mode
    - Test: pressing Escape cancels without saving
    - Test: greeting text updates immediately after save

- [ ] 7. Implement `TimerModule`
  - Create `TimerModule` as an IIFE with private: `intervalHandle`, `secondsLeft`, `durationSecs`, `isRunning`
  - `init()` loads `Store.get('ld_timer_min', 25)`, sets initial state, calls `render()`
  - `render()` updates display text via `formatTimerDisplay(secondsLeft)`, toggles `.running` / `.finished` classes, and correctly enables/disables Start, Stop, Set, and duration input
  - Implement `start()`, `stop()`, `reset()`, `setDuration()` as private functions, each calling `render()` after state change
  - On timer reaching zero: clear interval, set label to "🎉 Time's up! Great focus session!", call `render()`
  - `setDuration()` uses `clampDuration()` from utils, stops any running timer, persists via `Store.set('ld_timer_min', …)`
  - Bind Start, Stop, Reset, Set buttons and Enter on the minutes input
  - _Requirements: 6.1–6.13_

  - [ ]* 7.1 Write example tests for `TimerModule` button states
    - Test: idle state — Start enabled, Stop disabled, Set enabled
    - Test: after Start — Start disabled, Stop enabled, Set disabled, input disabled
    - Test: after Stop — Start enabled, Stop disabled
    - Test: after timer reaches zero — Start disabled, Stop disabled, Set enabled, finished class present

- [~] 8. Checkpoint — Ensure all tests pass for Clock, Theme, Name, Timer modules
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Extract task pure helpers into `js/utils.js`
  - Add `createTask(text)`, `isDuplicate(tasks, text)`, `sortTasks(tasks, order)` to `utils.js`
  - `createTask`: returns `{ id: generateId(), text, done: false }`
  - `isDuplicate`: returns `tasks.some(t => t.text.toLowerCase() === text.toLowerCase())`
  - `sortTasks`: returns a sorted copy without mutating the original; supports orders `az`, `za`, `done`, `undone`, `default`
  - _Requirements: 7.1, 7.2, 7.11–7.15_

  - [ ]* 9.1 Write property test for task addition
    - **Property 8: Task addition grows list**
    - **Validates: Requirements 7.1**
    - Use `fc.array(taskArb)` × `fc.string({ minLength: 1 })` filtered to non-duplicates; assert list length grows by 1 and new task is present with `done: false`

  - [ ]* 9.2 Write property test for duplicate detection
    - **Property 9: Duplicate detection**
    - **Validates: Requirements 7.2**
    - Use `fc.array(taskArb)` × `fc.string()`; assert `isDuplicate` returns `true` for any existing task's text (any case), `false` for fresh text

  - [ ]* 9.3 Write property test for toggle done
    - **Property 10: Toggle done is its own inverse**
    - **Validates: Requirements 7.4**
    - Use `fc.array(taskArb, { minLength: 1 })`; toggle a random task twice; assert original `done` value is restored

  - [ ]* 9.4 Write property test for delete task
    - **Property 11: Delete removes exactly one task**
    - **Validates: Requirements 7.5**
    - Use `fc.array(taskArb, { minLength: 1 })`; delete a random task; assert list shrinks by 1 and task id is absent

  - [ ]* 9.5 Write property test for sort correctness
    - **Property 12: Sort correctness**
    - **Validates: Requirements 7.11, 7.12, 7.13, 7.14, 7.15**
    - Use `fc.array(taskArb)` × `fc.constantFrom('az','za','done','undone','default')`; assert sort invariants for each order and that the result contains the same items

- [ ] 10. Implement `TaskModule`
  - Create `TaskModule` as an IIFE with private `tasks` array
  - `init()` loads from `Store.get('ld_tasks', [])`, calls `render()`
  - `render()` calls `sortTasks(tasks, currentOrder)`, clears and re-populates the `<ul>`, toggles the empty hint
  - Task item DOM construction: checkbox (`aria-label`), text span, edit icon button, delete button — all in a `buildTaskItem(task)` helper
  - `addTask()`: validate non-empty, call `isDuplicate`, show/hide error, call `createTask`, push, save, render
  - `toggleTask(id)`, `deleteTask(id)`: mutate `tasks`, save, render
  - `startEditTask(id, li, span)`: replace span with an inline input, save on blur/Enter, cancel on Escape
  - Error display: `showTaskError(msg)` shows the `#taskError` element and auto-clears after 3 s using a debounced timer; `clearTaskError()` hides it immediately
  - Bind Add button, Enter on task input, input event (clear error), sort select change
  - _Requirements: 7.1–7.16, 10.3, 10.5_

  - [ ]* 10.1 Write example tests for `TaskModule` UI behaviour
    - Test: adding empty task — input is focused, list unchanged
    - Test: adding duplicate — error message appears, list unchanged
    - Test: error clears when input changes
    - Test: inline edit saves trimmed text on blur
    - Test: Escape during inline edit restores original text without saving
    - Test: done task has `.done` class and strikethrough style

- [ ] 11. Extract link pure helper into `js/utils.js`
  - Add `normaliseUrl(url)` to `utils.js`
  - Returns `"https://" + url` if the URL does not already begin with `http://` or `https://` (case-insensitive regex `/^https?:\/\//i`)
  - Otherwise returns the URL unchanged
  - _Requirements: 8.1, 8.2_

  - [ ]* 11.1 Write property test for URL normalisation
    - **Property 13: URL normalisation**
    - **Validates: Requirements 8.1, 8.2**
    - Use `fc.string()` filtered to strings not starting with `http://` or `https://`; assert result starts with `"https://"`. Use `fc.webUrl()` to generate valid https URLs; assert unchanged.

- [ ] 12. Implement `LinkModule`
  - Create `LinkModule` as an IIFE with private `links` array
  - `init()` loads from `Store.get('ld_links', [])`, calls `render()`
  - `render()` clears and re-populates `#linksGrid`, toggles the empty hint
  - Chip DOM construction: a wrapper `<div>`, an `<a>` with `target="_blank" rel="noopener noreferrer"`, a remove `<button>` with aria-label
  - `addLink()`: validate URL non-empty, call `normaliseUrl`, fall back to URL as label, push, save, render
  - `deleteLink(id)`: filter, save, render
  - Bind Add Link button, Enter on both link inputs
  - _Requirements: 8.1–8.7, 10.1_

  - [ ]* 12.1 Write example tests for `LinkModule` UI behaviour
    - Test: adding a link without scheme prepends `https://`
    - Test: blank label falls back to URL as label
    - Test: chip remove button deletes the link
    - Test: chip `<a>` has `target="_blank"` and `rel="noopener noreferrer"`
    - Test: empty URL submission does nothing

- [ ] 13. Wire all modules in `init()` and validate accessibility
  - Write a single `init()` function at the bottom of `app.js` that calls:
    `ClockModule.start()`, `ThemeModule.init()`, `NameModule.init(ClockModule)`, `TimerModule.init()`, `TaskModule.init()`, `LinkModule.init()`
  - Verify `index.html` has `aria-label` on all interactive controls without visible text labels
  - Verify `#taskError` has `role="alert"`
  - Verify the sort `<select>` has a visually-hidden `<label>` (`.sr-only`)
  - Verify focus returns to `#taskInput` after adding a task
  - _Requirements: 10.1–10.5, 11.1, 11.2, 11.3, 11.4_

  - [ ]* 13.1 Write accessibility spot-check tests
    - Test: every `<button>` without visible text has a non-empty `aria-label`
    - Test: `#taskError` has `role="alert"`
    - Test: `#sortSelect` has an associated `<label>` element

- [~] 14. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Manually verify in a browser: clock ticks, theme persists on reload, name persists on reload, timer counts down and shows "Time's up", task CRUD with sort, link chips open correct URLs, layout collapses on mobile viewport.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP delivery.
- All property tests use **fast-check** (`npm install --save-dev fast-check vitest`); run tests with `npx vitest --run`.
- `js/utils.js` must be loaded before `js/app.js` in `index.html`.
- localStorage keys (`ld_tasks`, `ld_links`, `ld_theme`, `ld_name`, `ld_timer_min`) are unchanged so existing user data is preserved.
- No global mutable variables — all cross-module communication goes through explicit function parameters or return values.
