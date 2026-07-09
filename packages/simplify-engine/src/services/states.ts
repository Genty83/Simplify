/******************************************************************************
 * @module simplify-engine/src/core/states
 * @version 1.0.0
 * @author
 *   SimplifyUI Engineering — Craig Gent
 *
 * @description
 * Structural, deterministic, and generic state‑driven styling utilities for
 * mapping interaction states to values in a predictable, SSR‑safe way.
 *
 * Responsibilities:
 * - structural state wrappers (`states`)
 * - detection of stateful values (`isStateful`)
 * - tuple → state map conversion (`tupleToStates`)
 * - raw state object detection (`isRawStateObject`)
 * - deterministic state expansion (`expandStateObject`)
 * - unified state expansion (`expandStateValue`)
 * - automatic wrapping (`autoStates`)
 *
 * Non‑Responsibilities:
 * - interacting with the DOM
 * - generating CSS
 * - managing registries or caches
 *
 * Design Principles:
 * - pure single‑responsibility functions
 * - structural (no prototype reliance)
 * - deterministic ordering (based on `stateKeys`)
 * - minimal branching
 * - no magic numbers or hidden invariants
 ***************************************************************************** */

import type { StateValue, StateKey, StateWrapper, PrimitiveValue } from "../types";
import { stateKeys } from "../config";

// ============================================================================
// INTERNAL ERRORS
// ============================================================================

/**
 * @function errTupleLengthMismatch
 * @description
 * Throws when a tuple contains more entries than the provided active state
 * keys, indicating a structural configuration error.
 *
 * @param tupleLen The length of the tuple.
 * @param stateLen The length of the active state keys.
 */
function errTupleLengthMismatch(tupleLen: number, stateLen: number): never {
  throw new Error(
    `SimplifyUI/states: tuple length ${tupleLen} exceeds activeStates length ${stateLen}`,
  );
}

// ============================================================================
// PUBLIC WRAPPER
// ============================================================================

/**
 * @function states
 * @description
 * Wraps a value in a structural state wrapper used by the state engine.
 *
 * @param value A state‑capable value (bare, tuple, or state object).
 * @returns A structural state wrapper.
 */
export function states<T>(value: StateValue<T>): StateWrapper<T> {
  return { __states: true, value };
}

/**
 * @function isStateful
 * @description
 * Type guard detecting a structural state wrapper produced by `states`.
 *
 * @param value Any unknown value.
 * @returns True if the value is a state wrapper.
 */
export function isStateful<T>(value: unknown): value is StateWrapper<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "__states" in value &&
    (value as Record<string, unknown>).__states === true
  );
}

// ============================================================================
// TUPLE → STATE MAP
// ============================================================================

/**
 * @function tupleToStates
 * @description
 * Converts a tuple of values into a state‑keyed record using the provided
 * active state keys.
 *
 * @param tuple The ordered list of values.
 * @param activeStates The ordered list of state keys.
 * @returns A state‑keyed record.
 */
export function tupleToStates<T>(
  tuple: readonly T[],
  activeStates: readonly StateKey[],
): Partial<Record<StateKey, T>>{
  if (tuple.length > activeStates.length) {
    errTupleLengthMismatch(tuple.length, activeStates.length);
  }

  const out: Partial<Record<StateKey, T>> = {};
  for (let i = 0; i < tuple.length; i++) out[activeStates[i]] = tuple[i];
  return out;
}

// ============================================================================
// RAW STATE OBJECT DETECTION
// ============================================================================

/**
 * @function isRawStateObject
 * @description
 * Determines whether a value is a raw state object keyed exclusively by
 * known `StateKey` values.
 *
 * @param value Any unknown value.
 * @returns True if the value is a state‑keyed object.
 */
export function isRawStateObject<T>(
  value: unknown,
): value is Partial<Record<StateKey, T>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const keys = Object.keys(value);
  if (keys.length === 0) return false;

  return keys.every((k) => stateKeys.includes(k as StateKey));
}

// ============================================================================
// STATE OBJECT EXPANSION
// ============================================================================

/**
 * @function expandStateObject
 * @description
 * Expands a state object into an ordered list of `[stateKey, value]` pairs
 * following the canonical `stateKeys` ordering.
 *
 * @param value A state‑keyed object.
 * @returns An ordered list of state/value pairs.
 */
export function expandStateObject<T>(
  value: Partial<Record<StateKey, T>>,
): Array<[StateKey, T]> {
  const out: Array<[StateKey, T]> = [];

  for (const key of stateKeys) {
    const v = value[key];
    if (v !== undefined) out.push([key, v]);
  }

  return out;
}

// ============================================================================
// INTERNAL: BARE VALUE DETECTION
// ============================================================================

/**
 * @function isBareStateValue
 * @description
 * Type guard detecting the bare value branch of a StateValue<T>.
 *
 * @param value A state value.
 * @returns True if the value is the bare T branch.
 */
function isBareStateValue<T>(value: StateValue<T>): value is T {
  return !Array.isArray(value) && !isRawStateObject<T>(value);
}

// ============================================================================
// INTERNAL: WRAPPED VALUE EXPANSION
// ============================================================================

/**
 * @function expandWrapped
 * @description
 * Expands a state value into normalized state/value pairs using the active
 * state keys when needed.
 *
 * @param value The state value (bare, tuple, or state object).
 * @param activeStates The ordered list of active state keys.
 * @returns A normalized list of state/value pairs.
 */
function expandWrapped<T>(
  value: StateValue<T>,
  activeStates: readonly StateKey[],
): Array<[StateKey, T]> {
  if (Array.isArray(value)) {
    return expandStateObject(tupleToStates(value, activeStates));
  }

  if (isRawStateObject<T>(value)) {
    return expandStateObject(value);
  }

  if (isBareStateValue<T>(value)) {
    return [["base", value]];
  }

  throw new Error("SimplifyUI/states: unreachable branch in expandWrapped");
}

// ============================================================================
// UNIFIED STATE VALUE EXPANSION
// ============================================================================

/**
 * @function expandStateValue
 * @description
 * Expands any state‑capable value into a normalized list of `[stateKey, value]`
 * pairs. Accepts either a structural wrapper or a raw state value.
 *
 * @param raw The raw input value or state wrapper.
 * @param activeStates The ordered list of active state keys.
 * @returns A normalized list of state/value pairs.
 */
export function expandStateValue<T>(
  raw: StateValue<T> | StateWrapper<T>,
  activeStates: readonly StateKey[],
): Array<[StateKey, PrimitiveValue<T>]>{
  if (isStateful<T>(raw)) return expandWrapped(raw.value, activeStates);

  return expandWrapped(raw as StateValue<T>, activeStates);
}

// ============================================================================
// AUTO‑WRAPPING
// ============================================================================

/**
 * @function autoStates
 * @description
 * Automatically wraps tuples or raw state objects in a structural state
 * wrapper; leaves bare values unchanged.
 *
 * @param value Any unknown value.
 * @param activeStates The ordered list of active state keys.
 * @returns A wrapped value when applicable, otherwise the original value.
 */
export function autoStates(
  value: unknown,
  activeStates: readonly StateKey[],
): unknown {
  if (Array.isArray(value)) return states(tupleToStates(value, activeStates));

  if (isRawStateObject(value)) return states(value);

  return value;
}
