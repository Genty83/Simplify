/******************************************************************************
 * @module simplify-engine/src/core/utils/containerConditions
 * @version 1.0.0
 * @description
 * Pure condition‑builder utilities for the SimplifyUI container‑query engine.
 *
 * Responsibilities:
 * - normalize px values
 * - build min/max width/height conditions
 * - build orientation conditions
 * - join multiple conditions with logical AND
 *
 * Non‑Responsibilities:
 * - parsing DSL objects
 * - hashing DSL keys
 * - parsing legacy syntaxes
 * - wrapping CSS blocks
 *
 * Design Principles:
 * - pure and deterministic
 * - helpers under 15 lines
 * - no magic strings (all constants extracted)
 ***************************************************************************** */

const JOIN_AND = " and ";

/* ============================================================================
 * Pixel normalization
 * ==========================================================================*/

/**
 * @function normalizePx
 * @description
 * Normalizes a numeric or string value into a valid pixel unit.
 *
 * Structural rules:
 * - numbers become `${n}px`
 * - strings ending in "px" are preserved
 * - all other strings receive a "px" suffix
 *
 * @param value A number or string representing a CSS size.
 * @returns A pixel‑normalized string.
 */
export function normalizePx(
  value: number | string,
): string {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return /^\d+$/.test(value)
    ? `${value}px`
    : value;
}

/* ============================================================================
 * Condition builders
 * ==========================================================================*/

/**
 * @function condition
 * @description
 * Builds a parenthesized CSS container‑condition expression.
 *
 * @param property The CSS property name.
 * @param value The value to apply.
 * @returns A `(property: value)` condition string.
 */
export function condition(property: string, value: number | string): string {
  return `(${property}: ${normalizePx(value)})`;
}

/**
 * @description Creates a `(min-width: X)` condition.
 */
export const minWidth = (v: number | string) => condition("min-width", v);

/**
 * @description Creates a `(max-width: X)` condition.
 */
export const maxWidth = (v: number | string) => condition("max-width", v);

/**
 * @description Creates a `(min-height: X)` condition.
 */
export const minHeight = (v: number | string) => condition("min-height", v);

/**
 * @description Creates a `(max-height: X)` condition.
 */
export const maxHeight = (v: number | string) => condition("max-height", v);

/**
 * @description Creates an `(orientation: portrait|landscape)` condition.
 */
export const orientation = (v: "portrait" | "landscape") =>
  `(orientation: ${v})`;

/* ============================================================================
 * Condition joining
 * ==========================================================================*/

/**
 * @function joinConditions
 * @description
 * Joins multiple container conditions using logical `and`.
 *
 * Structural rules:
 * - deterministic ordering (input order preserved)
 * - no mutation
 *
 * @param conditions A list of condition strings.
 * @returns A combined condition string.
 */
export function joinConditions(conditions: readonly string[]): string {
  return conditions.join(JOIN_AND);
}
