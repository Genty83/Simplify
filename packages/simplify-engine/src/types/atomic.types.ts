/**
 * @module simplify-engine/src/types/atomic
 * @version 1.2.0
 *
 * @description
 * Atomic‑rule type contracts for the SimplifyUI engine.
 *
 * Defines the smallest unit of compiled CSS output: the `AtomicRule`.
 * Atomic rules represent fully‑resolved CSS declarations with optional
 * breakpoint, container, state, and selector‑override metadata.
 *
 * Structural Rules:
 * - Rectangular shape (no inferred fields)
 * - Deterministic metadata
 * - No widening types (`any`, `unknown`, `object`)
 * - Safe for SSR, workers, and edge runtimes
 */

import type { AnyBreakpoint } from "./breakpoints.types";
import type { StateKey } from "./states.types";

/**
 * @type AtomicValue
 * @description
 * Allowed value types for an atomic CSS rule.
 *
 * Includes:
 * - primitive CSS values
 * - structural wrapper objects (responsive, stateful, container, paint, etc.)
 *
 * Notes:
 * - Uses an interface for recursive structures to avoid TS2456.
 * - No `any`, `unknown`, or `object` is used.
 */
export type AtomicValue = string | number | AtomicValueMap;

/**
 * @type AtomicValueMap
 * @description
 * Recursive structural wrapper for atomic values.
 *
 * Notes:
 * - Interfaces support safe recursion; type aliases do not.
 */
export interface AtomicValueMap {
  [key: string]: AtomicValue;
}

/**
 * @type AtomicRule
 * @description
 * The smallest unit of compiled CSS output.
 *
 * Each atomic rule corresponds to a single CSS declaration with optional:
 * - responsive breakpoint
 * - container query wrapper
 * - state selector
 * - selector override (for global utilities)
 *
 * Selector Override:
 * - When present, the compiler emits this selector instead of the hashed classname.
 * - Used exclusively by the `globals` sheet utility.
 *
 * Example:
 * const rule: AtomicRule = {
 *   namespace: "layout",
 *   property: "display",
 *   value: "flex",
 *   selectorOverride: "body"
 * };
 */
export interface AtomicRule {
  /** Namespace of the utility or subsystem that produced this rule. */
  namespace: string;

  /** CSS property name (e.g., `margin`, `background-color`). */
  property: string;

  /** Raw or wrapped CSS value. */
  value: AtomicValue;

  /** Optional responsive breakpoint. */
  breakpoint?: AnyBreakpoint;

  /** Optional container query identifier (e.g., "@container (min-width: 500px)"). */
  container?: string;

  /** Optional state key (hover, pressed, ariaSelected, etc.). */
  state?: StateKey;

  /**
   * Optional selector override.
   *
   * When present, the compiler emits this selector instead of the hashed classname.
   * Used by global utilities to target real selectors (e.g., "body", "a:hover").
   */
  selectorOverride?: string;
}
