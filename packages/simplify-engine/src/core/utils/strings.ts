/******************************************************************************
 * @module simplify-engine/src/core/utils/strings
 * @version 1.0.0
 * @author Craig Gent
 *
 * @description
 * Pure string and primitive‑normalization helpers used across the Simplify engine.
 *
 * Responsibilities:
 * - camelCase → kebab-case conversion
 * - primitive → CSS value normalization
 *
 * Non‑Responsibilities:
 * - handling breakpoints
 * - generating CSS
 * - interacting with DOM or environment features
 *
 * Design Principles:
 * - pure and deterministic
 * - rectangular branching (no inference)
 * - safe for SSR, workers, and edge runtimes
 ***************************************************************************** */

/* ============================================================================
 * Constants
 * ==========================================================================*/

const UPPERCASE_CHARACTER_REGEX = /[A-Z]/g;

/* ============================================================================
 * Public API
 * ==========================================================================*/

/**
 * @function toKebab
 * @description
 * Converts a camelCase or PascalCase string into kebab-case.
 *
 * Structural rules:
 * - inserts a hyphen before each uppercase letter
 * - lowercases all inserted segments
 * - does not trim, collapse, or infer anything
 *
 * @param str The input string.
 * @returns The kebab-case version of the string.
 */
export function toKebab(value: string): string {
  return value.replace(
    UPPERCASE_CHARACTER_REGEX,
    (character) => `-${character.toLowerCase()}`,
  );
}
/**
 * @function normalize
 * @description
 * Normalizes primitive values into valid CSS values.
 *
 * Structural rules:
 * - numbers become pixel values (e.g., `12` → `"12px"`)
 * - strings are returned unchanged
 * - all other types are rejected
 *
 * @param value A number or string representing a CSS value.
 * @returns A normalized CSS value string.
 * @throws {TypeError} If the value is not a string or number.
 */
export function normalize(value: unknown): string | number {
  if (typeof value === "number") return `${value}px`;
  if (typeof value === "string") return value;

  throw new TypeError(
    `normalize(): expected a string or number, received ${typeof value}`,
  );
}
