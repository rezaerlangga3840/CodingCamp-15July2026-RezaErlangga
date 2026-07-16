# Requirements Document

## Introduction

The To-Do List Life Dashboard is a standalone single-page web application built with HTML, CSS, and Vanilla JavaScript. It provides users with a personal productivity hub featuring a greeting widget with live clock, a Pomodoro focus timer, a full-featured to-do list, a quick-links launcher, and a light/dark theme toggle. All data is persisted client-side via the browser's Local Storage API, requiring no backend server.

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **Task**: A to-do item created by the user with a text description and a completion status.
- **Task_List**: The ordered collection of Task items displayed in the Dashboard.
- **Timer**: The Pomodoro focus countdown timer widget.
- **Quick_Link**: A user-defined entry consisting of a label and a URL that opens in a new browser tab.
- **Theme**: The visual color scheme of the Dashboard, either "light" or "dark".
- **LocalStorage**: The browser's `window.localStorage` API used for client-side persistence.
- **Greeting_Widget**: The section of the Dashboard showing the current time, date, and a time-based greeting with the user's name.
- **User_Name**: A customizable string representing the user's display name, stored in LocalStorage.

---

## Requirements

### Requirement 1: Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a personalized greeting, so that I feel welcomed and oriented when I open the Dashboard.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current time updated every second.
2. THE Greeting_Widget SHALL display the current date in a human-readable format.
3. WHEN the current hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the current hour is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the current hour is between 18:00 and 04:59 (next day), THE Greeting_Widget SHALL display the greeting "Good Evening".
6. THE Greeting_Widget SHALL display the User_Name as part of the greeting message.
7. WHEN a user edits the User_Name field and confirms, THE Dashboard SHALL save the new User_Name to LocalStorage.
8. WHEN the Dashboard loads, THE Greeting_Widget SHALL retrieve and display the stored User_Name from LocalStorage, defaulting to "User" if none is stored.

---

### Requirement 2: Focus Timer (Pomodoro)

**User Story:** As a user, I want a configurable countdown timer, so that I can manage focused work sessions using the Pomodoro technique.

#### Acceptance Criteria

1. THE Timer SHALL display a countdown in MM:SS format.
2. WHEN the Dashboard loads, THE Timer SHALL initialize with a default duration of 25 minutes.
3. WHEN a user sets a custom duration and the Timer is not running, THE Timer SHALL update the countdown to reflect the new duration.
4. WHEN a user clicks the Start button and the Timer is not running, THE Timer SHALL begin counting down each second.
5. WHEN a user clicks the Stop button and the Timer is running, THE Timer SHALL pause the countdown at the current remaining time.
6. WHEN a user clicks the Reset button, THE Timer SHALL stop counting and restore the countdown to the currently configured duration.
7. WHEN the Timer countdown reaches 00:00, THE Timer SHALL stop automatically and notify the user via a browser alert or audio cue.

---

### Requirement 3: To-Do List

**User Story:** As a user, I want to manage a list of tasks, so that I can track and organize my work items.

#### Acceptance Criteria

1. WHEN a user enters a task description and submits, THE Task_List SHALL add a new Task with that description and a default completion status of false.
2. WHEN a user attempts to add a Task whose description (case-insensitively trimmed) matches an existing Task, THE Task_List SHALL reject the addition and display an error message.
3. WHEN a user attempts to add a Task with an empty or whitespace-only description, THE Task_List SHALL reject the addition and display an error message.
4. WHEN a user marks a Task as done, THE Task_List SHALL update that Task's completion status to true and apply a visual strike-through style.
5. WHEN a user unmarks a completed Task, THE Task_List SHALL update that Task's completion status to false and remove the strike-through style.
6. WHEN a user edits a Task, THE Task_List SHALL update the Task's description with the new value.
7. WHEN a user deletes a Task, THE Task_List SHALL remove that Task from the collection.
8. WHEN a user selects a sort option, THE Task_List SHALL reorder displayed Tasks according to the selected sort criterion (completion status or alphabetical order).
9. WHEN the Task_List is modified (add, edit, delete, or status change), THE Dashboard SHALL persist the updated Task_List to LocalStorage immediately.
10. WHEN the Dashboard loads, THE Task_List SHALL retrieve and display all Tasks previously saved in LocalStorage.

---

### Requirement 4: Quick Links

**User Story:** As a user, I want to save and launch my favorite websites from the Dashboard, so that I can access them quickly without typing URLs.

#### Acceptance Criteria

1. WHEN a user submits a label and a valid URL, THE Dashboard SHALL add a new Quick_Link entry to the quick links collection.
2. WHEN a user clicks a Quick_Link button, THE Dashboard SHALL open the associated URL in a new browser tab.
3. WHEN a user deletes a Quick_Link, THE Dashboard SHALL remove that entry from the quick links collection.
4. WHEN the quick links collection is modified, THE Dashboard SHALL persist the updated collection to LocalStorage immediately.
5. WHEN the Dashboard loads, THE Dashboard SHALL retrieve and display all Quick_Link entries previously saved in LocalStorage.
6. IF a user attempts to add a Quick_Link with an empty label or an invalid URL, THEN THE Dashboard SHALL reject the addition and display an error message.

---

### Requirement 5: Light / Dark Mode

**User Story:** As a user, I want to toggle between light and dark themes, so that I can choose the visual style that is comfortable for my environment.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a toggle control to switch between light and dark Theme.
2. WHEN a user activates the dark Theme, THE Dashboard SHALL apply dark color styles to all visible elements.
3. WHEN a user activates the light Theme, THE Dashboard SHALL apply light color styles to all visible elements.
4. WHEN the Theme is changed, THE Dashboard SHALL persist the selected Theme value to LocalStorage.
5. WHEN the Dashboard loads, THE Dashboard SHALL retrieve the stored Theme from LocalStorage and apply it; defaulting to light Theme if none is stored.

---

### Requirement 6: File and Project Structure

**User Story:** As a developer, I want a clean, organized file structure, so that the project is easy to maintain and extend.

#### Acceptance Criteria

1. THE Dashboard SHALL be delivered as a single `index.html` file at the project root.
2. THE Dashboard SHALL use exactly one CSS file located at `css/style.css`.
3. THE Dashboard SHALL use exactly one JavaScript file located at `js/app.js`.
4. THE `index.html` file SHALL link the CSS file and the JavaScript file using relative paths.
5. THE Dashboard SHALL function correctly when opened directly in a browser as a local file (using the `file://` protocol) without a server.
