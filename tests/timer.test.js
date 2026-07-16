// Feature: life-dashboard-rebuild
// Properties 6, 7 — Timer display and duration clamping

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { formatTimerDisplay, clampDuration } from '../js/utils.js';

// ─── Property 6: Timer display format correctness ────────────────────────────
// Validates: Requirements 6.1
describe('formatTimerDisplay', () => {
  it('matches MM:SS pattern and correct zero-padded values for any seconds in [0, 7200]', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 7200 }), (seconds) => {
        const result = formatTimerDisplay(seconds);

        // Must match MM:SS pattern
        expect(result).toMatch(/^\d{2}:\d{2}$/);

        const [mm, ss] = result.split(':').map(Number);
        expect(mm).toBe(Math.floor(seconds / 60));
        expect(ss).toBe(seconds % 60);
      }),
      { numRuns: 200 }
    );
  });
});

// ─── Property 7: Duration clamping ───────────────────────────────────────────
// Validates: Requirements 6.10
describe('clampDuration', () => {
  it('always returns an integer in [1, 120] for any input in [-1000, 1000]', () => {
    fc.assert(
      fc.property(fc.integer({ min: -1000, max: 1000 }), (raw) => {
        const result = clampDuration(raw);

        // Must be in [1, 120]
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(120);

        // Must be an integer
        expect(Number.isInteger(result)).toBe(true);

        // Specific bounds
        if (raw < 1)   expect(result).toBe(1);
        if (raw > 120) expect(result).toBe(120);
        if (raw >= 1 && raw <= 120) expect(result).toBe(Math.round(raw));
      }),
      { numRuns: 200 }
    );
  });
});
