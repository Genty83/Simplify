/**
 * @module simplify-engine/src/types/atomic
 * @version 1.1.0
 *
 * @description
 * Atomic‑rule type contracts for the SimplifyUI engine.
 *
 * Defines the smallest unit of compiled CSS output: the `AtomicRule`.
 * Atomic rules represent fully‑resolved CSS declarations with optional
 * breakpoint, container, and state metadata.
 *
 * Structural Rules:
 * - Rectangular shape (no inferred fields)
 * - Deterministic metadata
 * - No widening types (`any`, `unknown`, `object`)
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
 * @notes
 * - Uses an interface for recursive structures to avoid TS2456.
 * - No `any`, `unknown`, or `object` is used.
 */
export type AtomicValue = string | number | AtomicValueMap;

/**
 * @type AtomicValueMap
 * @description
 * Recursive structural wrapper for atomic values.
 *
 * @notes
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
 * Each atomic rule corresponds to a single CSS declaration with optional
 * breakpoint, container, and state metadata.
 *
 * @example
 * const rule: AtomicRule = {
 *   namespace: "layout",
 *   property: "display",
 *   value: "flex"
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

  /** Optional container query identifier. */
  container?: string;

  /** Optional state key (hover, pressed, ariaSelected, etc.). */
  state?: StateKey;
}
