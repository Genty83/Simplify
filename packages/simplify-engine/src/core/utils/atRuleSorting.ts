/******************************************************************************
 * @module simplify-engine/src/core/utils/atRuleSorting
 * @version 2.0.0
 * @author
 *   SimplifyUI Engineering — Craig Gent
 *
 * @description
 * Deterministic sorting utilities for CSS at‑rules used by the Simplify
 * runtime stylesheet emitter.
 *
 * Responsibilities:
 * - Extract numeric min-width values from at‑rule keys
 * - Provide a stable comparator for ordering at‑rules
 *
 * Non‑Responsibilities:
 * - Generating CSS
 * - Interacting with the DOM
 * - Managing selectors or state priority
 *
 * Design Principles:
 * - Pure and deterministic
 * - Rectangular branching (no inference)
 * - Safe for SSR, workers, and edge runtimes
 ******************************************************************************/

const BASE_AT_RULE = "base";
const CONTAINER_AT_RULE = "@container";

/* ============================================================================
 * Min-width extraction
 * ==========================================================================*/

/**
 * @function extractMinWidth
 * @description
 * Extracts the numeric min-width value from an at‑rule key.
 *
 * Structural rules:
 * - Expects the format "min-width: Npx"
 * - Returns MAX_SAFE_INTEGER if no numeric width is found
 * - No inference or fallback beyond this rule
 *
 * @param atRule The at‑rule key string.
 * @returns The extracted pixel value or MAX_SAFE_INTEGER.
 */
export function extractMinWidth(atRule: string): number {
  const idx = atRule.indexOf("min-width:");
  if (idx === -1) return Number.MAX_SAFE_INTEGER;

  const match = atRule.match(/min-width:\s*(\d+)px/);
  return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

/* ============================================================================
 * At‑rule comparator
 * ==========================================================================*/

/**
 * @function compareAtRules
 * @description
 * Deterministically compares two at‑rule keys.
 *
 * Ordering rules:
 * 1. "base" always comes first
 * 2. Container queries come before media queries
 * 3. Container queries are sorted lexicographically
 * 4. Media queries are sorted by min-width ascending
 * 5. Fallback: lexicographic ordering
 *
 * Structural rules:
 * - No inference beyond explicit prefix checks
 * - Stable ordering guarantees predictable stylesheet output
 *
 * @param a The first at‑rule key.
 * @param b The second at‑rule key.
 * @returns A negative, zero, or positive number for sorting.
 */
export function compareAtRules(a: string, b: string): number {
  // 1. Base always first
  if (a === BASE_AT_RULE) return -1;
  if (b === BASE_AT_RULE) return 1;

  const aIsContainer = a.startsWith(CONTAINER_AT_RULE);
  const bIsContainer = b.startsWith(CONTAINER_AT_RULE);

  // 2. Container queries before media queries
  if (aIsContainer !== bIsContainer) {
    return aIsContainer ? -1 : 1;
  }

  // 3. Container queries: lexicographic ordering
  if (aIsContainer && bIsContainer) {
    return a.localeCompare(b);
  }

  // 4. Media queries: sort by min-width ascending
  const minA = extractMinWidth(a);
  const minB = extractMinWidth(b);

  if (minA !== minB) {
    return minA - minB;
  }

  // 5. Fallback: lexicographic ordering
  return a.localeCompare(b);
}

/* ============================================================================
 * Test‑only exports
 * ==========================================================================*/

export const __TESTING__ = {
  extractMinWidth,
  compareAtRules,
};
