/* ============================================================
   js/utils.js — Pure utility functions for Life Dashboard
   Exposed on a global `Utils` object (no build step needed).
   Also exported as ES module named exports for test files.
   ============================================================ */

'use strict';

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

/**
 * Zero-pads a number to at least two digits.
 * @param {number} n
 * @returns {string}
 */
function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Formats a Date as "HH:MM:SS" using local time.
 * @param {Date} date
 * @returns {string}
 */
function formatClockTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Formats a Date as "Day, D Month YYYY" e.g. "Wednesday, 15 July 2026".
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Returns the contextual greeting phrase for the given hour and optional name.
 * @param {number} hour  0–23
 * @param {string} name  optional user name (empty string = no name)
 * @returns {string}
 */
function getGreetingText(hour, name) {
  let phrase;
  if      (hour >= 5  && hour < 12) phrase = 'Good morning';
  else if (hour >= 12 && hour < 17) phrase = 'Good afternoon';
  else if (hour >= 17 && hour < 21) phrase = 'Good evening';
  else                               phrase = 'Good night';
  return name ? `${phrase}, ${name}! 👋` : `${phrase}! 👋`;
}

/**
 * Formats a seconds count as "MM:SS".
 * @param {number} seconds  non-negative integer
 * @returns {string}
 */
function formatTimerDisplay(seconds) {
  return `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;
}

/**
 * Clamps a raw numeric input to the valid duration range [1, 120].
 * Non-finite / NaN values are clamped to 1.
 * @param {number} raw
 * @returns {number}  integer in [1, 120]
 */
function clampDuration(raw) {
  const n = Math.round(Number(raw));
  if (!isFinite(n) || n < 1)   return 1;
  if (n > 120)                  return 120;
  return n;
}

/* ──────────────────────────────────────────────────────────────
   Global namespace (browser / script-tag usage)
────────────────────────────────────────────────────────────── */
/* istanbul ignore next */
if (typeof window !== 'undefined') {
  window.Utils = { pad, formatClockTime, formatDate, getGreetingText, formatTimerDisplay, clampDuration };
  // Also expose DAYS/MONTHS for app.js backwards-compat (app.js already has its own copies,
  // but modules later can use Utils.DAYS / Utils.MONTHS if needed)
  window.Utils.DAYS   = DAYS;
  window.Utils.MONTHS = MONTHS;
}

/* ──────────────────────────────────────────────────────────────
   ES module exports (test files import these directly)
────────────────────────────────────────────────────────────── */
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS (vitest transforms to ESM, but keep this for safety)
  module.exports = { pad, formatClockTime, formatDate, getGreetingText, formatTimerDisplay, clampDuration };
}

export { pad, formatClockTime, formatDate, getGreetingText, formatTimerDisplay, clampDuration };
