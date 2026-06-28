/******************************************************************************
 * @module simplify-engine/src/core/utils/atRuleSorting
 * @version 1.0.0
 * @author Craig
 *
 * @description
 * Deterministic sorting utilities for CSS at‑rules used by the Simplify
 * runtime stylesheet emitter.
 *
 * Responsibilities:
 * - extract numeric min-width values from at‑rule keys
 * - provide a stable comparator for ordering at‑rules
 *
 * Non‑Responsibilities:
 * - generating CSS
 * - interacting with the DOM
 * - managing selectors or state priority
 *
 * Design Principles:
 * - pure and deterministic
 * - rectangular branching (no inference)
 * - safe for SSR, workers, and edge runtimes
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
 * - expects the format "min-width: Npx"
 * - returns MAX_SAFE_INTEGER if no numeric width is found
 * - no inference or fallback beyond this rule
 *
 * @param atRule The at‑rule key string.
 * @returns The extracted pixel value or MAX_SAFE_INTEGER.
 */
export function extractMinWidth(atRule: string): number {
  // Fast path: avoid regex unless necessary
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
 * 2. container queries come before media queries
 * 3. media queries are sorted by min-width ascending
 *
 * Structural rules:
 * - no inference beyond explicit prefix checks
 * - stable ordering guarantees predictable stylesheet output
 *
 * @param a The first at‑rule key.
 * @param b The second at‑rule key.
 * @returns A negative, zero, or positive number for sorting.
 */
export function compareAtRules(a: string, b: string): number {
  if (a === BASE_AT_RULE) return -1;
  if (b === BASE_AT_RULE) return 1;

  const aIsContainer = a.startsWith(CONTAINER_AT_RULE);
  const bIsContainer = b.startsWith(CONTAINER_AT_RULE);

  if (aIsContainer !== bIsContainer) {
    return aIsContainer ? -1 : 1;
  }

  const minA = extractMinWidth(a);
  const minB = extractMinWidth(b);

  return minA - minB;
}

/* ============================================================================
 * Test‑only exports
 * ==========================================================================*/

export const __TESTING__ = {
  extractMinWidth,
  compareAtRules,
};
