/******************************************************************************
 * @module simplify-engine/src/types/states
 * @version 1.1.0
 * @author
 *   SimplifyUI Engineering — Craig Gent
 *
 * @description
 * Declarative type contracts for SimplifyUI’s state‑driven styling model.
 *
 * Defines:
 * - `StateKey` — supported interaction/ARIA/data state keys
 * - `StateLeaf<T>` — terminal values inside a state tree
 * - `StateObject<T>` — recursive state maps keyed by `StateKey`
 * - `StateValue<T>` — union of leaf or recursive object
 * - `StateWrapper<T>` — structural wrapper for stateful values
 *
 * Responsibilities:
 * - Provide strongly‑typed state contracts
 * - Maintain inference‑safe recursive structures
 * - Avoid widening (`any`, `unknown`, `never`)
 * - Remain dependency‑light and cycle‑free
 *
 * Non‑Responsibilities:
 * - Runtime state expansion
 * - CSS generation
 * - Responsive merging
 *
 * Design Principles:
 * - Purely declarative
 * - Structural typing only
 * - Deterministic, bounded recursion
 * - No runtime logic
 ***************************************************************************** */

import type {
  PrimitiveValue,
  ResponsivePrimitive,
  ResponsiveWrapper,
} from "./primitive.types";

// ============================================================================
// STATE KEYS
// ============================================================================

/**
 * @type StateKey
 * @description
 * All supported state keys for stateful styling.
 *
 * Includes:
 * - interaction states
 * - ARIA states
 * - data attribute states
 * - a `custom` escape hatch
 */
export type StateKey =
  | "base"
  | "hover"
  | "pressed"
  | "focus"
  | "focusVisible"
  | "focusWithin"
  | "active"
  | "disabled"
  | "ariaExpanded"
  | "ariaSelected"
  | "ariaChecked"
  | "ariaPressed"
  | "ariaDisabled"
  | "ariaCurrent"
  | "ariaBusy"
  | "dataOpen"
  | "dataActive"
  | "dataDisabled"
  | "custom";

// ============================================================================
// STATE LEAF VALUES
// ============================================================================

/**
 * @type StateLeaf<T>
 * @description
 * A terminal value inside a state tree.
 *
 * A leaf may be:
 * - a primitive value
 * - a responsive primitive
 * - a responsive wrapper
 *
 * @example
 * const leaf: StateLeaf<string> = "red";
 *
 * @notes
 * - No `unknown` variants are included to preserve inference.
 * - This type is intentionally narrow and inference‑friendly.
 */
export type StateLeaf<T> =
  | PrimitiveValue<T>
  | ResponsivePrimitive<T>
  | ResponsiveWrapper<T>;

// ============================================================================
// RECURSIVE STATE OBJECT
// ============================================================================

/**
 * @type StateObject<T>
 * @description
 * A recursive state object keyed by `StateKey`.
 *
 * @example
 * const obj: StateObject<string> = {
 *   base: "red",
 *   hover: "blue",
 *   pressed: { hover: "purple" }
 * };
 *
 * @notes
 * - Recursion is bounded and inference‑safe.
 * - Keys are restricted to `StateKey`.
 */
export type StateObject<T> = {
  [K in StateKey]?: StateLeaf<T> | StateObject<T>;
};

// ============================================================================
// STATE VALUE
// ============================================================================

/**
 * @type StateValue<T>
 * @description
 * Any supported state value:
 * - a leaf
 * - a recursive state object
 *
 * @example
 * const v1: StateValue<string> = "red";
 * const v2: StateValue<string> = { hover: "blue" };
 */
export type StateValue<T> = StateLeaf<T> | StateObject<T>;

// ============================================================================
// STATE WRAPPER
// ============================================================================

/**
 * @type StateWrapper<T>
 * @description
 * Structural wrapper marking a value as stateful.
 *
 * Ensures:
 * - deterministic shape for compiler passes
 * - safe detection via the `__states` tag
 *
 * @example
 * const wrapped: StateWrapper<string> = {
 *   __states: true,
 *   value: { hover: "blue" }
 * };
 *
 * @notes
 * - Wraps `StateValue<T>` directly (no primitive re‑wrapping).
 */
export interface StateWrapper<T> {
  __states: true;
  value: StateValue<T>;
}
