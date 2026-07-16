# Requirements Document

## Introduction

The Life Dashboard is a single-page personal dashboard built with vanilla HTML, CSS, and JavaScript (no framework, no build step). The goal of this rebuild is to recreate every existing feature — live clock, contextual greeting, editable name, dark/light theme, focus countdown timer, to-do list, and quick-links bookmarks — while improving code architecture: proper module encapsulation, no global variable sprawl, consistent naming conventions, and maintained accessibility. localStorage is the persistence layer using the same keys as the original app (`ld_tasks`, `ld_links`, `ld_theme`, `ld_name`, `ld_timer_min`).

---

## Glossary

- **Dashboard**: The single HTML page that hosts all widgets.
- **Module**: A self-contained JavaScript object or IIFE that owns its own state and exposes only a public API.
- **Store**: The thin localStorage wrapper responsible for all read/write operations.
- **Clock**: The live HH:MM:SS time display inside the header.
- **Greeting**: The contextual phrase ("Good morning/afternoon/evening/night") that changes based on the hour.
- **Timer**: The focus countdown timer widget.
- **Task**: A single to-do item with an `id`, `text`, and `done` boolean.
- **Task_List**: The ordered collection of Task objects managed by the To-Do module.
- **Link**: A bookmark object with an `id`, `label`, and `url` string.
- **Link_List**: The ordered collection of Link objects managed by the Quick Links module.
- **Theme**: The active colour scheme — either `"light"` or `"dark"`.
- **Chip**: The pill-shaped button that represents a Link in the UI.
- **Sort_Order**: The active sort mode for the Task_List (`default`, `az`, `za`, `done`, `undone`).
- **Duration**: The configured countdown length in whole minutes (1–120).

---

## Requirements

### Requirement 1: Persistent Storage Layer

**User Story:** As a developer, I want a single encapsulated storage module, so that all localStorage access is centralised and every other module reads/writes through one consistent API.

#### Acceptance Criteria

1. THE Store SHALL expose a `get(key, fallback)` method that returns the parsed JSON value for the given key, or `fallback` if the key is absent or JSON parsing fails.
2. THE Store SHALL expose a `set(key, value)` method that serialises the value to JSON and writes it to localStorage, silently ignoring write errors.
3. WHEN the Store is imported by another module, THE Store SHALL not expose any internal implementation details beyond `get` and `set`.

---

### Requirement 2: Header — Live Clock and Date

**User Story:** As a user, I want to see the current time and date at a glance, so that I can stay oriented without leaving the dashboard.

#### Acceptance Criteria

1. THE Clock SHALL display the current local time in `HH:MM:SS` format, updated every second.
2. THE Dashboard SHALL display the current date formatted as `Day, D Month YYYY` (e.g., "Wednesday, 15 July 2026").
3. WHEN the seconds digit changes, THE Clock SHALL update the displayed value within 100 ms.
4. THE Clock module SHALL manage its own `setInterval` and SHALL NOT expose the interval handle outside the module.

---

### Requirement 3: Header — Contextual Greeting

**User Story:** As a user, I want a greeting that reflects the time of day, so that the dashboard feels personal and context-aware.

#### Acceptance Criteria

1. WHEN the local hour is between 5 (inclusive) and 12 (exclusive), THE Greeting SHALL display "Good morning".
2. WHEN the local hour is between 12 (inclusive) and 17 (exclusive), THE Greeting SHALL display "Good afternoon".
3. WHEN the local hour is between 17 (inclusive) and 21 (exclusive), THE Greeting SHALL display "Good evening".
4. WHEN the local hour is between 21 (inclusive) or before 5 (exclusive), THE Greeting SHALL display "Good night".
5. WHEN a user name is saved, THE Greeting SHALL append `, {name}! 👋` to the phrase.
6. WHEN no user name is saved, THE Greeting SHALL append `! 👋` to the phrase without a name.

---

### Requirement 4: Header — Editable User Name

**User Story:** As a user, I want to set and update my name, so that greetings and the header feel personalised.

#### Acceptance Criteria

1. THE Dashboard SHALL display a name field in the header showing the saved name, or the placeholder "Set your name" when none is stored.
2. WHEN a user clicks the edit icon, THE Dashboard SHALL replace the name display with a text input pre-filled with the current name.
3. WHEN a user submits the name edit (Save button or Enter key), THE Dashboard SHALL trim the input value, persist it via the Store, update the name display, and refresh the Greeting immediately.
4. WHEN a user presses Escape during name editing, THE Dashboard SHALL cancel the edit and restore the name display without saving.
5. THE Store SHALL persist the name under the key `ld_name`.

---

### Requirement 5: Theme — Dark/Light Mode

**User Story:** As a user, I want to switch between dark and light themes, so that the dashboard is comfortable to use in any lighting condition.

#### Acceptance Criteria

1. THE Dashboard SHALL apply the active Theme by setting the `data-theme` attribute on `<html>` to `"light"` or `"dark"`.
2. WHEN a user clicks the theme toggle button, THE Dashboard SHALL switch from the current Theme to the other Theme.
3. THE Store SHALL persist the active Theme under the key `ld_theme`.
4. WHEN the Dashboard initialises, THE Dashboard SHALL read the stored Theme and apply it before the first render, defaulting to `"light"` if no value is stored.
5. WHEN the Theme is `"dark"`, THE Dashboard SHALL display a ☀️ icon on the toggle button; WHEN the Theme is `"light"`, THE Dashboard SHALL display a 🌙 icon.

---

### Requirement 6: Focus Timer

**User Story:** As a user, I want a configurable countdown timer, so that I can run timed focus sessions without leaving the dashboard.

#### Acceptance Criteria

1. THE Timer SHALL display the remaining time in `MM:SS` format.
2. WHEN the Timer is idle (not running and not finished), THE Dashboard SHALL enable the Start button and disable the Stop button.
3. WHEN a user clicks Start, THE Timer SHALL begin counting down by one second per second.
4. WHEN the Timer is running, THE Dashboard SHALL disable the Start button and enable the Stop button.
5. WHEN a user clicks Stop, THE Timer SHALL pause, and THE Dashboard SHALL enable the Start button and disable the Stop button.
6. WHEN a user clicks Reset, THE Timer SHALL stop (if running) and restore the remaining time to the current Duration.
7. WHEN the Timer reaches zero, THE Timer SHALL stop automatically, THE Dashboard SHALL display the message "🎉 Time's up! Great focus session!", and THE Timer display SHALL animate with a pulsing opacity effect.
8. WHEN the Timer has reached zero, THE Dashboard SHALL disable both the Start and Stop buttons until the Duration is reset.
9. THE Dashboard SHALL provide a numeric input (1–120) and a Set button that allow the user to change the Duration at any time the Timer is not running.
10. WHEN a user sets a new Duration, THE Timer SHALL clamp the input to the range [1, 120], stop any running countdown, and reset the remaining time to the new Duration.
11. THE Store SHALL persist the configured Duration in minutes under the key `ld_timer_min`.
12. WHEN the Dashboard initialises, THE Timer SHALL load the persisted Duration (defaulting to 25 min) and display it.
13. WHILE the Timer is running, THE Duration input and Set button SHALL be disabled.

---

### Requirement 7: To-Do List

**User Story:** As a user, I want to manage a personal task list, so that I can capture, organise, and track the things I need to do.

#### Acceptance Criteria

1. WHEN a user types a non-empty, non-duplicate task description and submits (Add button or Enter key), THE Task_List SHALL create a new Task with a unique `id`, the trimmed description, and `done: false`, then persist it and re-render the list.
2. WHEN a user attempts to add a task whose description matches an existing Task's text (case-insensitive), THE Dashboard SHALL display an inline error message and SHALL NOT add the duplicate Task.
3. THE inline error message SHALL auto-dismiss after 3 seconds or when the user modifies the input field.
4. WHEN a user toggles a Task's checkbox, THE Task_List SHALL flip the Task's `done` state, persist the change, and re-render.
5. WHEN a user clicks the Delete button on a Task, THE Task_List SHALL remove that Task, persist the change, and re-render.
6. WHEN a user clicks the edit icon on a Task, THE Dashboard SHALL replace the Task's text display with an inline text input pre-filled with the current text.
7. WHEN the inline edit input loses focus or the user presses Enter, THE Task_List SHALL save the trimmed new text (if non-empty and changed) and re-render.
8. WHEN a user presses Escape during inline editing, THE Task_List SHALL cancel the edit without saving and re-render the original text.
9. THE Dashboard SHALL render a done Task's text with a line-through decoration and reduced opacity.
10. THE Store SHALL persist the Task_List under the key `ld_tasks` as a JSON array of `{ id, text, done }` objects.
11. WHEN the Sort_Order is `az`, THE Task_List SHALL render tasks sorted alphabetically A → Z by text.
12. WHEN the Sort_Order is `za`, THE Task_List SHALL render tasks sorted alphabetically Z → A by text.
13. WHEN the Sort_Order is `done`, THE Task_List SHALL render undone tasks before done tasks.
14. WHEN the Sort_Order is `undone`, THE Task_List SHALL render done tasks before undone tasks.
15. WHEN the Sort_Order is `default`, THE Task_List SHALL render tasks in insertion order.
16. WHEN the Task_List is empty, THE Dashboard SHALL display the empty-state hint "No tasks yet. Add one above!"

---

### Requirement 8: Quick Links

**User Story:** As a user, I want to save frequently-visited URLs as labelled bookmark chips, so that I can navigate to them with a single click.

#### Acceptance Criteria

1. WHEN a user provides a URL (with or without a scheme) and clicks Add Link or presses Enter in either input, THE Link_List SHALL create a new Link with a unique `id`, the trimmed label (falling back to the URL if blank), and the URL with `https://` prepended if no scheme is present.
2. WHEN a URL already begins with `http://` or `https://`, THE Dashboard SHALL preserve the original scheme and SHALL NOT prepend an extra `https://`.
3. THE Dashboard SHALL render each Link as a Chip showing the label and a remove button (✕).
4. WHEN a user clicks a Chip's label, THE Dashboard SHALL open the Link's URL in a new browser tab with `rel="noopener noreferrer"`.
5. WHEN a user clicks a Chip's remove button, THE Link_List SHALL remove that Link, persist the change, and re-render.
6. THE Store SHALL persist the Link_List under the key `ld_links` as a JSON array of `{ id, label, url }` objects.
7. WHEN the Link_List is empty, THE Dashboard SHALL display the empty-state hint "No links yet. Add your favorites!"

---

### Requirement 9: Responsive Layout

**User Story:** As a user, I want the dashboard to be usable on both desktop and mobile screens, so that I can access it from any device.

#### Acceptance Criteria

1. THE Dashboard SHALL display a 2-column grid layout on screens wider than 640 px, with the Timer in column 1 and the Task_List in column 2, and the Link_List spanning both columns below.
2. WHEN the viewport is 640 px wide or narrower, THE Dashboard SHALL collapse to a single-column layout with sections stacked vertically.
3. THE Dashboard SHALL use CSS custom properties (`--primary`, `--surface`, `--text`, etc.) for all theme-sensitive colours so that both Theme variants are implemented without duplicating layout CSS.

---

### Requirement 10: Accessibility

**User Story:** As a user relying on keyboard navigation or assistive technology, I want all interactive elements to be accessible, so that the dashboard is usable without a mouse.

#### Acceptance Criteria

1. THE Dashboard SHALL provide an `aria-label` attribute on every interactive control that does not have a visible text label.
2. THE Dashboard SHALL include a visually-hidden (`sr-only`) `<label>` for the sort dropdown so screen readers can identify it.
3. THE inline task error message element SHALL carry `role="alert"` so screen readers announce it automatically.
4. THE Dashboard SHALL ensure all interactive elements are reachable and activatable via the Tab and Enter/Space keys.
5. THE Dashboard SHALL not remove focus from the task input after a task is added, so users can add multiple tasks without reaching for the mouse.

---

### Requirement 11: Code Architecture

**User Story:** As a developer, I want the JavaScript to be organised into distinct, encapsulated modules, so that each feature can be understood, tested, and modified in isolation.

#### Acceptance Criteria

1. THE Dashboard SHALL implement each major feature (Store, Clock/Greeting, Theme, Name, Timer, Tasks, Links) as a separate JavaScript module or IIFE with its own private state.
2. THE Dashboard SHALL NOT use global variables to share state between modules; cross-module communication SHALL occur only through explicit function calls or events.
3. THE Dashboard SHALL use consistent naming conventions: `camelCase` for variables and functions, `SCREAMING_SNAKE_CASE` for constants, and `PascalCase` is not required since no classes are needed.
4. THE Dashboard SHALL keep the same three-file structure: `index.html`, `css/style.css`, and `js/app.js`, with no build step required.
5. WHEN new features are added in the future, the architecture SHALL allow adding a new module without modifying existing modules.
