/**
 * Life Dashboard — app.js
 * Vanilla JS, no frameworks, no build step.
 * All state persisted via localStorage.
 */

(function () {
  'use strict';

  /* ================================================================
     LOCALSTORAGE WRAPPER
     Catches SecurityError / QuotaExceededError and shows warning.
  ================================================================ */
  const LS_KEYS = {
    userName: 'userName',
    tasks: 'tasks',
    quickLinks: 'quickLinks',
    theme: 'theme',
    timerDuration: 'timerDuration',
  };

  let _lsAvailable = true;

  function _lsGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      _lsAvailable = false;
      _showLsWarning();
      return null;
    }
  }

  function _lsSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      _lsAvailable = false;
      _showLsWarning();
    }
  }

  function _showLsWarning() {
    const el = document.getElementById('ls-warning');
    if (el) el.style.display = 'block';
  }

  /* ================================================================
     THEME MODULE
     Property 17: saveTheme → loadTheme round-trip
  ================================================================ */
  const ThemeModule = {
    /** @returns {'light'|'dark'} */
    loadTheme() {
      return _lsGet(LS_KEYS.theme) === 'dark' ? 'dark' : 'light';
    },

    /** @param {'light'|'dark'} theme */
    saveTheme(theme) {
      _lsSet(LS_KEYS.theme, theme);
    },

    /** @param {'light'|'dark'} theme */
    applyTheme(theme) {
      document.body.classList.toggle('dark', theme === 'dark');
      document.body.classList.toggle('light', theme === 'light');
      const icon = document.getElementById('theme-icon');
      if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    },

    toggleTheme() {
      const current = ThemeModule.loadTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      ThemeModule.saveTheme(next);
      ThemeModule.applyTheme(next);
    },

    init() {
      const theme = ThemeModule.loadTheme();
      ThemeModule.applyTheme(theme);

      const btn = document.getElementById('theme-toggle');
      if (btn) {
        btn.addEventListener('click', () => ThemeModule.toggleTheme());
      }
    },
  };

  /* ================================================================
     GREETING MODULE
     Property 1: formatDate returns non-empty string
     Property 2: getGreeting returns correct period + name
     Property 3: saveUserName → loadUserName round-trip
  ================================================================ */
  const GreetingModule = {
    /**
     * Returns "Good Morning/Afternoon/Evening/Night, {name}!"
     * Morning:   05:00 – 11:59
     * Afternoon: 12:00 – 17:59
     * Evening:   18:00 – 19:59
     * Night:     20:00 – 04:59
     * @param {number} hour  0–23
     * @param {string} name
     * @returns {string}
     */
    getGreeting(hour, name) {
      let period;
      if (hour >= 5 && hour <= 11) {
        period = 'Good Morning';
      } else if (hour >= 12 && hour <= 17) {
        period = 'Good Afternoon';
      } else if (hour >= 18 && hour <= 19) {
        period = 'Good Evening';
      } else {
        period = 'Good Night';
      }
      return `${period}, ${name}!`;
    },

    /**
     * Returns human-readable date string, e.g. "Wednesday, 16 July 2026"
     * @param {Date} date
     * @returns {string}
     */
    formatDate(date) {
      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    },

    /**
     * Returns HH:MM:SS string
     * @param {Date} date
     * @returns {string}
     */
    formatTime(date) {
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    },

    /** @returns {string} */
    loadUserName() {
      const stored = _lsGet(LS_KEYS.userName);
      return stored && stored.trim() !== '' ? stored : 'User';
    },

    /** @param {string} name */
    saveUserName(name) {
      _lsSet(LS_KEYS.userName, name.trim());
    },

    _intervalId: null,

    _render() {
      const now = new Date();
      const timeEl = document.getElementById('greeting-time');
      const dateEl = document.getElementById('greeting-date');
      const msgEl = document.getElementById('greeting-message');
      const nameInput = document.getElementById('name-input');

      if (timeEl) timeEl.textContent = GreetingModule.formatTime(now);
      if (dateEl) dateEl.textContent = GreetingModule.formatDate(now);
      if (msgEl) {
        const name = GreetingModule.loadUserName();
        msgEl.textContent = GreetingModule.getGreeting(now.getHours(), name);
      }
      if (nameInput && nameInput !== document.activeElement) {
        nameInput.value = GreetingModule.loadUserName() === 'User'
          ? ''
          : GreetingModule.loadUserName();
      }
    },

    init() {
      GreetingModule._render();

      // Seed the name input with stored value
      const nameInput = document.getElementById('name-input');
      const stored = GreetingModule.loadUserName();
      if (nameInput && stored !== 'User') {
        nameInput.value = stored;
      }

      // Save button
      const saveBtn = document.getElementById('name-save');
      if (saveBtn && nameInput) {
        const doSave = () => {
          const val = nameInput.value.trim();
          GreetingModule.saveUserName(val || 'User');
          GreetingModule._render();
        };
        saveBtn.addEventListener('click', doSave);
        nameInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') doSave();
        });
      }

      // Tick every second
      GreetingModule._intervalId = setInterval(() => GreetingModule._render(), 1000);
    },
  };

  /* ================================================================
     TIMER MODULE
     Property 4: formatTimerDisplay returns MM:SS for any valid seconds
  ================================================================ */
  const TimerModule = {
    state: {
      durationSeconds: 25 * 60, // configured duration
      remaining: 25 * 60,       // current countdown value
      running: false,
      intervalId: null,
    },

    /**
     * Converts total seconds → "MM:SS"
     * @param {number} totalSeconds  non-negative integer
     * @returns {string}
     */
    formatTimerDisplay(totalSeconds) {
      const s = Math.max(0, Math.floor(totalSeconds));
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      return `${mm}:${ss}`;
    },

    _updateDisplay() {
      const el = document.getElementById('timer-display');
      if (el) el.textContent = TimerModule.formatTimerDisplay(TimerModule.state.remaining);
    },

    _setButtonStates() {
      const startBtn = document.getElementById('timer-start');
      const stopBtn = document.getElementById('timer-stop');
      const durationInput = document.getElementById('timer-duration');
      if (startBtn) startBtn.disabled = TimerModule.state.running;
      if (stopBtn) stopBtn.disabled = !TimerModule.state.running;
      if (durationInput) durationInput.disabled = TimerModule.state.running;
    },

    startTimer() {
      if (TimerModule.state.running) return;
      if (TimerModule.state.remaining <= 0) return;

      TimerModule.state.running = true;
      TimerModule._setButtonStates();

      TimerModule.state.intervalId = setInterval(() => {
        TimerModule.state.remaining -= 1;
        TimerModule._updateDisplay();

        if (TimerModule.state.remaining <= 0) {
          TimerModule.stopTimer();
          // Notify user
          setTimeout(() => {
            alert('⏰ Focus session complete! Time for a break.');
          }, 100);
        }
      }, 1000);
    },

    stopTimer() {
      if (TimerModule.state.intervalId) {
        clearInterval(TimerModule.state.intervalId);
        TimerModule.state.intervalId = null;
      }
      TimerModule.state.running = false;
      TimerModule._setButtonStates();
    },

    resetTimer() {
      TimerModule.stopTimer();
      TimerModule.state.remaining = TimerModule.state.durationSeconds;
      TimerModule._updateDisplay();
    },

    init() {
      // Restore saved duration from localStorage
      const savedMinutes = parseInt(_lsGet(LS_KEYS.timerDuration), 10);
      if (!isNaN(savedMinutes) && savedMinutes >= 1 && savedMinutes <= 99) {
        TimerModule.state.durationSeconds = savedMinutes * 60;
        TimerModule.state.remaining = savedMinutes * 60;
      }

      TimerModule._updateDisplay();
      TimerModule._setButtonStates();

      const startBtn = document.getElementById('timer-start');
      const stopBtn = document.getElementById('timer-stop');
      const resetBtn = document.getElementById('timer-reset');
      const durationInput = document.getElementById('timer-duration');

      // Seed the input with the restored value
      if (durationInput) {
        durationInput.value = Math.floor(TimerModule.state.durationSeconds / 60);
      }

      if (startBtn) startBtn.addEventListener('click', () => TimerModule.startTimer());
      if (stopBtn) stopBtn.addEventListener('click', () => TimerModule.stopTimer());
      if (resetBtn) resetBtn.addEventListener('click', () => TimerModule.resetTimer());

      if (durationInput) {
        durationInput.addEventListener('change', () => {
          const val = parseInt(durationInput.value, 10);
          if (!isNaN(val) && val >= 1 && val <= 99) {
            TimerModule.state.durationSeconds = val * 60;
            _lsSet(LS_KEYS.timerDuration, val);
            TimerModule.resetTimer();
          } else {
            // Restore to sane value
            durationInput.value = Math.floor(TimerModule.state.durationSeconds / 60);
          }
        });
      }
    },
  };

  /* ================================================================
     TASK MODULE
     Properties 5–12
  ================================================================ */

  /**
   * @typedef {{ id: string, description: string, completed: boolean, createdAt: number }} Task
   * @typedef {{ ok: boolean, data?: any, error?: string }} Result
   * @typedef {'none'|'status'|'alpha'} SortCriterion
   */

  const TaskModule = {
    /**
     * Load tasks from localStorage.
     * @returns {Task[]}
     */
    loadTasks() {
      try {
        const raw = _lsGet(LS_KEYS.tasks);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn('Failed to parse tasks from localStorage', e);
        return [];
      }
    },

    /**
     * Persist tasks to localStorage.
     * @param {Task[]} tasks
     */
    saveTasks(tasks) {
      _lsSet(LS_KEYS.tasks, JSON.stringify(tasks));
    },

    /**
     * Add a task. Returns Result.
     * Validates: non-empty, no case-insensitive duplicate.
     * @param {Task[]} tasks
     * @param {string} description
     * @returns {Result}
     */
    addTask(tasks, description) {
      const trimmed = description.trim();
      if (trimmed === '') {
        return { ok: false, error: 'Task description cannot be empty.' };
      }
      const lower = trimmed.toLowerCase();
      const isDuplicate = tasks.some((t) => t.description.toLowerCase() === lower);
      if (isDuplicate) {
        return { ok: false, error: 'A task with this description already exists.' };
      }
      const newTask = {
        id: _generateId(),
        description: trimmed,
        completed: false,
        createdAt: Date.now(),
      };
      return { ok: true, data: [...tasks, newTask] };
    },

    /**
     * Delete a task by id.
     * @param {Task[]} tasks
     * @param {string} id
     * @returns {Task[]}
     */
    deleteTask(tasks, id) {
      return tasks.filter((t) => t.id !== id);
    },

    /**
     * Edit a task's description.
     * @param {Task[]} tasks
     * @param {string} id
     * @param {string} newDesc
     * @returns {Task[]}
     */
    editTask(tasks, id, newDesc) {
      const trimmed = newDesc.trim();
      if (!trimmed) return tasks;
      return tasks.map((t) => (t.id === id ? { ...t, description: trimmed } : t));
    },

    /**
     * Toggle a task's completed status.
     * @param {Task[]} tasks
     * @param {string} id
     * @returns {Task[]}
     */
    toggleTask(tasks, id) {
      return tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    },

    /**
     * Sort tasks by criterion.
     * @param {Task[]} tasks
     * @param {SortCriterion} criterion
     * @returns {Task[]}
     */
    sortTasks(tasks, criterion) {
      const copy = [...tasks];
      if (criterion === 'status') {
        copy.sort((a, b) => {
          if (a.completed === b.completed) return a.createdAt - b.createdAt;
          return a.completed ? 1 : -1; // incomplete first
        });
      } else if (criterion === 'alpha') {
        copy.sort((a, b) => a.description.localeCompare(b.description));
      } else {
        copy.sort((a, b) => a.createdAt - b.createdAt); // default: creation order
      }
      return copy;
    },

    _currentSort: 'none',

    /**
     * Rebuild task list DOM.
     * @param {Task[]} tasks
     */
    renderTasks(tasks) {
      const list = document.getElementById('todo-list');
      if (!list) return;

      const sorted = TaskModule.sortTasks(tasks, TaskModule._currentSort);
      list.innerHTML = '';

      sorted.forEach((task) => {
        const li = document.createElement('li');
        li.className = 'task-item' + (task.completed ? ' task-item--done' : '');
        li.dataset.id = task.id;

        // Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-item__checkbox';
        checkbox.checked = task.completed;
        checkbox.setAttribute('aria-label', `Mark "${task.description}" as ${task.completed ? 'incomplete' : 'complete'}`);
        checkbox.addEventListener('change', () => {
          let current = TaskModule.loadTasks();
          current = TaskModule.toggleTask(current, task.id);
          TaskModule.saveTasks(current);
          TaskModule.renderTasks(current);
        });

        // Text span
        const textSpan = document.createElement('span');
        textSpan.className = 'task-item__text';
        textSpan.textContent = task.description;

        // Actions container
        const actions = document.createElement('div');
        actions.className = 'task-item__actions';

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn--icon';
        editBtn.innerHTML = '✏️';
        editBtn.setAttribute('aria-label', `Edit task: ${task.description}`);
        editBtn.title = 'Edit task';
        editBtn.addEventListener('click', () => {
          TaskModule._enterEditMode(li, task, textSpan, editBtn);
        });

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn--icon btn--danger';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.setAttribute('aria-label', `Delete task: ${task.description}`);
        deleteBtn.title = 'Delete task';
        deleteBtn.addEventListener('click', () => {
          let current = TaskModule.loadTasks();
          current = TaskModule.deleteTask(current, task.id);
          TaskModule.saveTasks(current);
          TaskModule.renderTasks(current);
        });

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        li.appendChild(checkbox);
        li.appendChild(textSpan);
        li.appendChild(actions);
        list.appendChild(li);
      });

      // Task count
      const done = tasks.filter((t) => t.completed).length;
      let countEl = document.querySelector('.task-count');
      if (!countEl) {
        countEl = document.createElement('p');
        countEl.className = 'task-count';
        list.parentNode.insertBefore(countEl, list.nextSibling);
      }
      countEl.textContent = tasks.length === 0
        ? 'No tasks yet.'
        : `${done} / ${tasks.length} completed`;
    },

    _enterEditMode(li, task, textSpan, editBtn) {
      const editInput = document.createElement('input');
      editInput.type = 'text';
      editInput.className = 'task-item__edit-input';
      editInput.value = task.description;
      editInput.setAttribute('aria-label', 'Edit task description');

      li.replaceChild(editInput, textSpan);
      editBtn.innerHTML = '✅';
      editBtn.setAttribute('aria-label', 'Save edit');
      editInput.focus();
      editInput.select();

      const confirmEdit = () => {
        const newVal = editInput.value.trim();
        if (newVal && newVal !== task.description) {
          let current = TaskModule.loadTasks();
          current = TaskModule.editTask(current, task.id, newVal);
          TaskModule.saveTasks(current);
          TaskModule.renderTasks(current);
        } else {
          // Cancel edit
          TaskModule.renderTasks(TaskModule.loadTasks());
        }
      };

      editBtn.onclick = confirmEdit;
      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirmEdit();
        if (e.key === 'Escape') TaskModule.renderTasks(TaskModule.loadTasks());
      });
    },

    init() {
      const tasks = TaskModule.loadTasks();
      TaskModule.renderTasks(tasks);

      // Add task form
      const form = document.getElementById('todo-form');
      const input = document.getElementById('todo-input');
      const errorEl = document.getElementById('todo-error');

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (!input) return;
          const current = TaskModule.loadTasks();
          const result = TaskModule.addTask(current, input.value);
          if (!result.ok) {
            if (errorEl) {
              errorEl.textContent = result.error;
              setTimeout(() => { errorEl.textContent = ''; }, 3000);
            }
          } else {
            TaskModule.saveTasks(result.data);
            TaskModule.renderTasks(result.data);
            input.value = '';
            input.focus();
            if (errorEl) errorEl.textContent = '';
          }
        });
      }

      // Sort control
      const sortSelect = document.getElementById('sort-select');
      if (sortSelect) {
        sortSelect.addEventListener('change', () => {
          TaskModule._currentSort = sortSelect.value;
          TaskModule.renderTasks(TaskModule.loadTasks());
        });
      }
    },
  };

  /* ================================================================
     QUICK LINKS MODULE
     Properties 13–16
  ================================================================ */

  /**
   * @typedef {{ id: string, label: string, url: string }} QuickLink
   */

  const QuickLinksModule = {
    /**
     * Validate URL using URL constructor.
     * @param {string} url
     * @returns {boolean}
     */
    isValidUrl(url) {
      if (!url || url.trim() === '') return false;
      try {
        const parsed = new URL(url.trim());
        // Only allow http/https protocols
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch (e) {
        return false;
      }
    },

    /**
     * Load links from localStorage.
     * @returns {QuickLink[]}
     */
    loadLinks() {
      try {
        const raw = _lsGet(LS_KEYS.quickLinks);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.warn('Failed to parse quickLinks from localStorage', e);
        return [];
      }
    },

    /**
     * Persist links to localStorage.
     * @param {QuickLink[]} links
     */
    saveLinks(links) {
      _lsSet(LS_KEYS.quickLinks, JSON.stringify(links));
    },

    /**
     * Add a link. Returns Result.
     * @param {QuickLink[]} links
     * @param {string} label
     * @param {string} url
     * @returns {Result}
     */
    addLink(links, label, url) {
      const trimLabel = label.trim();
      const trimUrl = url.trim();
      if (trimLabel === '') {
        return { ok: false, error: 'Link label cannot be empty.' };
      }
      if (!QuickLinksModule.isValidUrl(trimUrl)) {
        return { ok: false, error: 'Please enter a valid URL (e.g. https://example.com).' };
      }
      const newLink = {
        id: _generateId(),
        label: trimLabel,
        url: trimUrl,
      };
      return { ok: true, data: [...links, newLink] };
    },

    /**
     * Delete a link by id.
     * @param {QuickLink[]} links
     * @param {string} id
     * @returns {QuickLink[]}
     */
    deleteLink(links, id) {
      return links.filter((l) => l.id !== id);
    },

    /**
     * Rebuild quick links DOM.
     * @param {QuickLink[]} links
     */
    renderLinks(links) {
      const container = document.getElementById('links-container');
      if (!container) return;
      container.innerHTML = '';

      if (links.length === 0) {
        const empty = document.createElement('p');
        empty.style.cssText = 'font-size:0.875rem; color:var(--color-text-muted);';
        empty.textContent = 'No links yet. Add your favorite sites above.';
        container.appendChild(empty);
        return;
      }

      links.forEach((link) => {
        const item = document.createElement('div');
        item.className = 'link-item';

        const anchor = document.createElement('a');
        anchor.className = 'link-item__anchor';
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = link.label;
        anchor.setAttribute('aria-label', `Open ${link.label} in new tab`);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'link-item__delete';
        deleteBtn.innerHTML = '✕';
        deleteBtn.setAttribute('aria-label', `Remove link: ${link.label}`);
        deleteBtn.title = 'Remove link';
        deleteBtn.addEventListener('click', () => {
          let current = QuickLinksModule.loadLinks();
          current = QuickLinksModule.deleteLink(current, link.id);
          QuickLinksModule.saveLinks(current);
          QuickLinksModule.renderLinks(current);
        });

        item.appendChild(anchor);
        item.appendChild(deleteBtn);
        container.appendChild(item);
      });
    },

    init() {
      const links = QuickLinksModule.loadLinks();
      QuickLinksModule.renderLinks(links);

      const form = document.getElementById('links-form');
      const labelInput = document.getElementById('link-label');
      const urlInput = document.getElementById('link-url');
      const errorEl = document.getElementById('links-error');

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const current = QuickLinksModule.loadLinks();
          const result = QuickLinksModule.addLink(
            current,
            labelInput ? labelInput.value : '',
            urlInput ? urlInput.value : ''
          );
          if (!result.ok) {
            if (errorEl) {
              errorEl.textContent = result.error;
              setTimeout(() => { errorEl.textContent = ''; }, 3000);
            }
          } else {
            QuickLinksModule.saveLinks(result.data);
            QuickLinksModule.renderLinks(result.data);
            if (labelInput) labelInput.value = '';
            if (urlInput) urlInput.value = '';
            if (errorEl) errorEl.textContent = '';
          }
        });
      }
    },
  };

  /* ================================================================
     UTILITIES
  ================================================================ */
  function _generateId() {
    // Use crypto.randomUUID if available, else fall back to timestamp+random
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  /* ================================================================
     BOOTSTRAP — DOMContentLoaded
  ================================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    ThemeModule.init();
    GreetingModule.init();
    TimerModule.init();
    TaskModule.init();
    QuickLinksModule.init();
  });

})();
