// Feature: life-dashboard-rebuild
// Property 1 — Store round-trip

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// ─── Store implementation (inline — mirrors app.js so it can be tested
//     without importing the DOM-heavy app.js) ──────────────────────────────────
const Store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch { /* swallow silently */ }
  },
};

// ─── Property 1: Store round-trip ────────────────────────────────────────────
// Validates: Requirements 1.1, 1.2
describe('Store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips any JSON-serialisable value through set → get', () => {
    fc.assert(
      fc.property(
        fc.string(),          // key
        fc.jsonValue(),       // value
        (key, value) => {
          Store.set(key, value);
          const retrieved = Store.get(key, null);
          expect(retrieved).toEqual(value);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('returns the fallback when the key does not exist', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.jsonValue(),
        (key, fallback) => {
          // Ensure key is absent
          localStorage.removeItem(key);
          const result = Store.get(key, fallback);
          expect(result).toEqual(fallback);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('returns the fallback when stored value is invalid JSON', () => {
    localStorage.setItem('bad_key', '{invalid json}');
    const fallback = { default: true };
    const result = Store.get('bad_key', fallback);
    expect(result).toEqual(fallback);
  });
});
