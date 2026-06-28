/******************************************************************************
 * @module simplify-engine/src/core/types/registry.types
 * @version 1.0.0
 * @author Craig
 *
 * @description
 * Structural types for the Simplify runtime stylesheet registry.
 *
 * Responsibilities:
 * - define the canonical RuleRegistry shape used by the runtime engine
 *
 * Non‑Responsibilities:
 * - storing rules
 * - generating CSS
 * - sorting selectors or at‑rules
 * - interacting with the DOM
 *
 * Design Principles:
 * - pure and deterministic
 * - rectangular (no optional or inferred fields)
 * - safe for SSR, workers, and edge runtimes
 ******************************************************************************/

/**
 * @description
 * Canonical registry shape used by the runtime stylesheet engine.
 *
 * Structure:
 * - layer → at‑rule → selector → declaration body
 *
 * Example:
 * {
 *   base: {
 *     base: {
 *       ".sui-abc": "color: red;",
 *       ".sui-def:hover": "background: blue;"
 *     },
 *     "min-width: 640px": {
 *       ".sui-xyz": "gap: 8px;"
 *     }
 *   }
 * }
 */
export type RuleRegistry = Record<
  string, // layer name
  Record<
    string, // at‑rule key (e.g., "base", "min-width: 640px", "@container size")
    Record<
      string, // CSS selector
      string  // CSS declaration body
    >
  >
>;
