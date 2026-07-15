/* ============================================================
   Life Dashboard — app.js
   Features: Clock/Greeting, Focus Timer, To-Do List,
             Quick Links, Dark Mode, Custom Name, Sort Tasks
   Storage : localStorage (keys: ld_tasks, ld_links, ld_theme, ld_name)
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────────────────────
   STORAGE HELPERS
────────────────────────────────────────────────────────────── */
const store = {
  get:    (key, fallback) => { try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set:    (key, val)      => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
};

/* ──────────────────────────────────────────────────────────────
   DOM REFERENCES
────────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

// Header
const greetingEl   = $('greeting');
const clockEl      = $('clock');
const dateEl       = $('date');
const nameDisplay  = $('nameDisplay');
const nameWrap     = $('nameWrap');
const nameEdit     = $('nameEdit');
const nameInput    = $('nameInput');
const editNameBtn  = $('editNameBtn');
const saveNameBtn  = $('saveNameBtn');
const themeToggle  = $('themeToggle');
const themeIcon    = $('themeIcon');

// Timer
const timerDisplay = $('timerDisplay');
const timerStart   = $('timerStart');
const timerStop    = $('timerStop');
const timerReset   = $('timerReset');
const timerLabel   = $('timerLabel');

// Todo
const taskInput    = $('taskInput');
const addTaskBtn   = $('addTaskBtn');
const taskList     = $('taskList');
const emptyHint    = $('emptyHint');
const sortSelect   = $('sortSelect');

// Links
const linkLabel      = $('linkLabel');
const linkUrl        = $('linkUrl');
const addLinkBtn     = $('addLinkBtn');
const linksGrid      = $('linksGrid');
const emptyLinksHint = $('emptyLinksHint');

/* ──────────────────────────────────────────────────────────────
   1. CLOCK & GREETING
────────────────────────────────────────────────────────────── */
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

function pad(n) { return String(n).padStart(2, '0'); }

function getGreetingText(hour, name) {
  let phrase;
  if (hour >= 5  && hour < 12) phrase = 'Good morning';
  else if (hour >= 12 && hour < 17) phrase = 'Good afternoon';
  else if (hour >= 17 && hour < 21) phrase = 'Good evening';
  else phrase = 'Good night';
  return name ? `${phrase}, ${name}! 👋` : `${phrase}! 👋`;
}

function updateClock() {
  const now  = new Date();
  const h    = now.getHours();
  const name = store.get('ld_name', '');

  clockEl.textContent   = `${pad(h)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  greetingEl.textContent = getGreetingText(h, name);
  dateEl.textContent    = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

setInterval(updateClock, 1000);
updateClock();

/* ──────────────────────────────────────────────────────────────
   2. DARK / LIGHT MODE
────────────────────────────────────────────────────────────── */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  store.set('ld_theme', theme);
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// Init theme
applyTheme(store.get('ld_theme', 'light'));

/* ──────────────────────────────────────────────────────────────
   3. CUSTOM NAME
────────────────────────────────────────────────────────────── */
function renderName() {
  const name = store.get('ld_name', '');
  nameDisplay.textContent = name || 'Set your name';
}

editNameBtn.addEventListener('click', () => {
  const name = store.get('ld_name', '');
  nameInput.value = name;
  nameWrap.classList.add('hidden');
  nameEdit.classList.remove('hidden');
  nameInput.focus();
});

function saveName() {
  const val = nameInput.value.trim();
  store.set('ld_name', val);
  renderName();
  nameEdit.classList.add('hidden');
  nameWrap.classList.remove('hidden');
  updateClock(); // refresh greeting immediately
}

saveNameBtn.addEventListener('click', saveName);
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { nameEdit.classList.add('hidden'); nameWrap.classList.remove('hidden'); } });

renderName();

/* ──────────────────────────────────────────────────────────────
   4. FOCUS TIMER
────────────────────────────────────────────────────────────── */
const TIMER_DURATION = 25 * 60; // seconds

let timerSeconds   = TIMER_DURATION;
let timerInterval  = null;
let timerRunning   = false;

function formatTime(s) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

function renderTimer() {
  timerDisplay.textContent = formatTime(timerSeconds);

  if (timerRunning) {
    timerDisplay.classList.add('running');
    timerDisplay.classList.remove('finished');
    timerStart.disabled = true;
    timerStop.disabled  = false;
  } else if (timerSeconds === 0) {
    timerDisplay.classList.add('finished');
    timerDisplay.classList.remove('running');
    timerStart.disabled = true;
    timerStop.disabled  = true;
  } else {
    timerDisplay.classList.remove('running', 'finished');
    timerStart.disabled = false;
    timerStop.disabled  = true;
  }
}

function tickTimer() {
  if (timerSeconds <= 0) {
    clearInterval(timerInterval);
    timerRunning  = false;
    timerSeconds  = 0;
    timerLabel.textContent = '🎉 Time\'s up! Great focus session!';
    renderTimer();
    return;
  }
  timerSeconds--;
  renderTimer();
}

timerStart.addEventListener('click', () => {
  if (timerRunning || timerSeconds === 0) return;
  timerRunning  = true;
  timerLabel.textContent = 'Session in progress…';
  timerInterval = setInterval(tickTimer, 1000);
  renderTimer();
});

timerStop.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning = false;
  timerLabel.textContent = 'Paused — click Start to continue.';
  renderTimer();
});

timerReset.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning  = false;
  timerSeconds  = TIMER_DURATION;
  timerLabel.textContent = 'Pomodoro — 25 min';
  renderTimer();
});

renderTimer();

/* ──────────────────────────────────────────────────────────────
   5. TO-DO LIST
────────────────────────────────────────────────────────────── */

// ── Data ────────────────────────────────────────────────────
let tasks = store.get('ld_tasks', []); // [{ id, text, done }]

function saveTasks() { store.set('ld_tasks', tasks); }

function nextId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// ── Sort ────────────────────────────────────────────────────
function getSortedTasks() {
  const order = sortSelect.value;
  const copy  = [...tasks];
  switch (order) {
    case 'az':     return copy.sort((a, b) => a.text.localeCompare(b.text));
    case 'za':     return copy.sort((a, b) => b.text.localeCompare(a.text));
    case 'done':   return copy.sort((a, b) => Number(a.done) - Number(b.done));
    case 'undone': return copy.sort((a, b) => Number(b.done) - Number(a.done));
    default:       return copy;
  }
}

// ── Render ──────────────────────────────────────────────────
function renderTasks() {
  taskList.innerHTML = '';
  const sorted = getSortedTasks();

  emptyHint.classList.toggle('hidden', sorted.length > 0);

  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.done ? ' done' : ''}`;
    li.dataset.id = task.id;

    // Checkbox
    const check = document.createElement('input');
    check.type      = 'checkbox';
    check.className = 'task-check';
    check.checked   = task.done;
    check.setAttribute('aria-label', `Mark "${task.text}" as ${task.done ? 'undone' : 'done'}`);
    check.addEventListener('change', () => toggleTask(task.id));

    // Text span
    const span = document.createElement('span');
    span.className   = 'task-text';
    span.textContent = task.text;

    // Actions
    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.textContent = '✏️';
    editBtn.title = 'Edit task';
    editBtn.setAttribute('aria-label', 'Edit task');
    editBtn.addEventListener('click', () => startEditTask(task.id, li, span));

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-delete';
    delBtn.textContent = 'Delete';
    delBtn.title = 'Delete task';
    delBtn.setAttribute('aria-label', 'Delete task');
    delBtn.addEventListener('click', () => deleteTask(task.id));

    actions.append(editBtn, delBtn);
    li.append(check, span, actions);
    taskList.appendChild(li);
  });
}

// ── Actions ─────────────────────────────────────────────────
function addTask() {
  const text = taskInput.value.trim();
  if (!text) { taskInput.focus(); return; }
  tasks.push({ id: nextId(), text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.done = !t.done; saveTasks(); renderTasks(); }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

function startEditTask(id, li, span) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const input = document.createElement('input');
  input.type      = 'text';
  input.className = 'task-edit-input';
  input.value     = task.text;
  input.maxLength = 120;
  input.setAttribute('aria-label', 'Edit task text');

  li.replaceChild(input, span);
  input.focus();
  input.select();

  function commitEdit() {
    const val = input.value.trim();
    if (val && val !== task.text) {
      task.text = val;
      saveTasks();
    }
    renderTasks();
  }

  input.addEventListener('blur',    commitEdit);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter')  { input.blur(); }
    if (e.key === 'Escape') { renderTasks(); } // cancel
  });
}

// ── Event Listeners ─────────────────────────────────────────
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
sortSelect.addEventListener('change', renderTasks);

renderTasks();

/* ──────────────────────────────────────────────────────────────
   6. QUICK LINKS
────────────────────────────────────────────────────────────── */

// ── Data ────────────────────────────────────────────────────
let links = store.get('ld_links', []); // [{ id, label, url }]

function saveLinks() { store.set('ld_links', links); }

// ── Render ──────────────────────────────────────────────────
function renderLinks() {
  linksGrid.innerHTML = '';
  emptyLinksHint.classList.toggle('hidden', links.length > 0);

  links.forEach(link => {
    const wrap = document.createElement('div');
    wrap.className = 'link-chip-wrap';

    const a = document.createElement('a');
    a.className = 'link-chip';
    a.href      = link.url;
    a.target    = '_blank';
    a.rel       = 'noopener noreferrer';
    a.textContent = link.label || link.url;
    a.title     = link.url;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'link-remove';
    removeBtn.textContent = '✕';
    removeBtn.title = `Remove ${link.label}`;
    removeBtn.setAttribute('aria-label', `Remove link ${link.label}`);
    removeBtn.addEventListener('click', () => deleteLink(link.id));

    wrap.append(a, removeBtn);
    linksGrid.appendChild(wrap);
  });
}

// ── Actions ─────────────────────────────────────────────────
function addLink() {
  const label = linkLabel.value.trim();
  let   url   = linkUrl.value.trim();

  if (!url) { linkUrl.focus(); return; }

  // Auto-prepend https:// if missing a scheme
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  links.push({ id: nextId(), label: label || url, url });
  saveLinks();
  renderLinks();
  linkLabel.value = '';
  linkUrl.value   = '';
  linkLabel.focus();
}

function deleteLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

// ── Event Listeners ─────────────────────────────────────────
addLinkBtn.addEventListener('click', addLink);
linkUrl.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });
linkLabel.addEventListener('keydown', e => { if (e.key === 'Enter') addLink(); });

renderLinks();
