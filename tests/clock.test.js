// Feature: life-dashboard-rebuild
// Properties 2, 3, 4, 5 — Clock / Date / Greeting

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  formatClockTime,
  formatDate,
  getGreetingText,
} from '../js/utils.js';

const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

// ─── Property 2: Clock time format correctness ───────────────────────────────
// Validates: Requirements 2.1
describe('formatClockTime', () => {
  it('matches HH:MM:SS pattern and correct zero-padded values for any Date', () => {
    fc.assert(
      fc.property(fc.date(), (date) => {
        const result = formatClockTime(date);
        // Must match HH:MM:SS pattern
        expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);

        const [hh, mm, ss] = result.split(':').map(Number);
        expect(hh).toBe(date.getHours());
        expect(mm).toBe(date.getMinutes());
        expect(ss).toBe(date.getSeconds());
      }),
      { numRuns: 200 }
    );
  });
});

// ─── Property 3: Date format correctness ─────────────────────────────────────
// Validates: Requirements 2.2
describe('formatDate', () => {
  it('contains day name, numeric day, month name, and year for any Date', () => {
    fc.assert(
      fc.property(fc.date(), (date) => {
        const result = formatDate(date);

        const expectedDay   = DAYS[date.getDay()];
        const expectedMonth = MONTHS[date.getMonth()];
        const expectedYear  = String(date.getFullYear());
        const expectedDate  = String(date.getDate());

        expect(result).toContain(expectedDay);
        expect(result).toContain(expectedDate);
        expect(result).toContain(expectedMonth);
        expect(result).toContain(expectedYear);
      }),
      { numRuns: 200 }
    );
  });
});

// ─── Property 4: Greeting phrase correctness ─────────────────────────────────
// Validates: Requirements 3.1, 3.2, 3.3, 3.4
describe('getGreetingText — phrase correctness', () => {
  it('returns the correct phrase for every hour in [0, 23]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
        const result = getGreetingText(hour, '');

        if (hour >= 5 && hour < 12) {
          expect(result).toMatch(/^Good morning/);
        } else if (hour >= 12 && hour < 17) {
          expect(result).toMatch(/^Good afternoon/);
        } else if (hour >= 17 && hour < 21) {
          expect(result).toMatch(/^Good evening/);
        } else {
          // [0, 4] ∪ [21, 23]
          expect(result).toMatch(/^Good night/);
        }
      }),
      { numRuns: 200 }
    );
  });
});

// ─── Property 5: Greeting name inclusion ─────────────────────────────────────
// Validates: Requirements 3.5, 3.6
describe('getGreetingText — name inclusion', () => {
  it('appends ", name! 👋" when name is non-empty', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }),
        fc.string({ minLength: 1 }),
        (hour, name) => {
          const result = getGreetingText(hour, name);
          expect(result).toMatch(new RegExp(`, ${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}! 👋$`));
        }
      ),
      { numRuns: 200 }
    );
  });

  it('ends with "! 👋" and has no comma before "!" when name is empty string', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 23 }), (hour) => {
        const result = getGreetingText(hour, '');
        expect(result).toMatch(/! 👋$/);
        // No comma immediately before the "!"
        expect(result).not.toMatch(/,\s*!/);
      }),
      { numRuns: 200 }
    );
  });
});
