/******************************************************************************
 * @module simplify-engine/src/core/utils/selectorState
 * @version 2.0.0
 * @author
 *   SimplifyUI Engineering — Craig Gent
 *
 * @description
 * Selector → state resolution and deterministic selector sorting.
 *
 * Responsibilities:
 * - Map CSS selectors to canonical Simplify state keys
 * - Apply statePriority ordering to selectors
 * - Provide a stable comparator for selector sorting
 *
 * Non‑Responsibilities:
 * - Generating CSS
 * - Interacting with the DOM
 * - Managing rule registries or at‑rules
 *
 * Design Principles:
 * - Pure and deterministic
 * - Rectangular branching (no inference)
 * - Zero regex in hot paths
 * - Safe for SSR, workers, and edge runtimes
 ******************************************************************************/

import type { StateKey } from "../../types";
import { statePriority, stateToSelector } from "../../config";

/* ============================================================================
 * Selector → State Table
 * ==========================================================================*/

type SelectorStateEntry = {
  selector: string;
  state: StateKey;
  isPseudo: boolean;
};

/**
 * @description
 * Builds a canonical selector → state mapping table.
 *
 * Structural rules:
 * - Longest selectors first to avoid partial matches
 * - Pseudo selectors match by suffix
 * - Attribute/data selectors match by substring
 */
const SELECTOR_STATE_TABLE: SelectorStateEntry[] = buildSelectorStateTable();

function buildSelectorStateTable(): SelectorStateEntry[] {
  const entries: SelectorStateEntry[] = [];

  for (const state of Object.keys(stateToSelector) as StateKey[]) {
    const sel = stateToSelector[state];
    if (!sel) continue;

    const isPseudo =
      sel.startsWith(":") ||
      sel.startsWith("::");

    entries.push({
      selector: sel,
      state,
      isPseudo,
    });
  }

  return entries.sort((a, b) => b.selector.length - a.selector.length);
}

/* ============================================================================
 * State Resolution
 * ==========================================================================*/

/**
 * @function getStateForSelector
 * @description
 * Resolves the canonical state key for a given CSS selector.
 *
 * Structural rules:
 * - Pseudo selectors match by suffix
 * - Attribute/data selectors match by substring
 * - Unmatched selectors resolve to "base"
 *
 * Globals:
 * - Element selectors (e.g., "body", "a") resolve to "base"
 * - Universal selectors ("*") resolve to "base"
 * - Root selectors (":root") resolve to "base"
 *
 * @param selector The CSS selector string.
 * @returns The resolved Simplify state key.
 */
export function getStateForSelector(selector: string): StateKey {
  for (const entry of SELECTOR_STATE_TABLE) {
    if (entry.isPseudo) {
      if (selector.endsWith(entry.selector)) {
        return entry.state;
      }
    } else {
      if (selector.includes(entry.selector)) {
        return entry.state;
      }
    }
  }

  return "base";
}

/* ============================================================================
 * Selector Comparator
 * ==========================================================================*/

/**
 * @function compareSelectors
 * @description
 * Deterministically compares two selectors using state priority first,
 * then lexicographic ordering as a stable tiebreaker.
 *
 * Structural rules:
 * - statePriority is authoritative
 * - no inference or selector parsing beyond state resolution
 * - stable ordering guarantees predictable stylesheet output
 *
 * Globals:
 * - Element selectors sort naturally via localeCompare
 * - Universal selectors ("*") sort naturally
 * - Root selectors (":root") sort naturally
 *
 * @param a The first selector.
 * @param b The second selector.
 * @returns A negative, zero, or positive number for sorting.
 */
export function compareSelectors(a: string, b: string): number {
  const sa = getStateForSelector(a);
  const sb = getStateForSelector(b);

  const pa = statePriority[sa] ?? 0;
  const pb = statePriority[sb] ?? 0;

  if (pa !== pb) return pa - pb;

  return a.localeCompare(b);
}

/* ============================================================================
 * Test‑only exports
 * ==========================================================================*/

export const __TESTING__ = {
  SELECTOR_STATE_TABLE,
  buildSelectorStateTable,
  getStateForSelector,
  compareSelectors,
};
