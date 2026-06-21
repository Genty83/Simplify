/******************************************************************************
 * @module simplify-engine/src/services/responsive
 * @version 1.0.0
 * @description
 * Public responsive services for the SimplifyUI engine.
 *
 * Responsibilities:
 * - responsive wrapper creation (`rs`)
 * - wrapper detection (`isResponsive`)
 * - tuple → responsive map conversion
 * - raw responsive object detection
 * - responsive expansion orchestration
 * - automatic responsive wrapping
 * - unified responsive expansion
 *
 * Non‑Responsibilities:
 * - breakpoint parsing
 * - breakpoint → px resolution
 * - dynamic key extraction
 * - named/default entry extraction
 *
 * Design Principles:
 * - pure and deterministic
 * - rectangular branching
 * - helpers under 15 lines
 * - no magic strings
 ***************************************************************************** */

import type { ResponsiveValue, AnyBreakpoint } from "../types";
import {
  isBreakpointKey,
  extractDefaultEntry,
  extractNamedEntries,
  extractDynamicKeys,
  expandDynamicEntries,
} from "../core/utils/responsiveHelpers";

/* ============================================================================
 * Responsive wrapper creation + detection
 * ==========================================================================*/

/**
 * @function rs
 * @description Wraps a responsive value in a SimplifyUI responsive wrapper.
 *
 * @param value A responsive map of breakpoint keys to values.
 * @returns A structural responsive wrapper.
 */
export function rs<T>(value: ResponsiveValue<T>) {
  return { __responsive: true as const, value };
}

/**
 * @function isResponsive
 * @description Determines whether a value is a SimplifyUI responsive wrapper.
 *
 * @param value The value to test.
 * @returns `true` if the value is a responsive wrapper.
 */
export function isResponsive(
  value: unknown,
): value is { __responsive: true; value: ResponsiveValue<unknown> } {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { __responsive?: unknown }).__responsive === true
  );
}

/* ============================================================================
 * Tuple → responsive map
 * ==========================================================================*/

/**
 * @function tupleToResponsive
 * @description Converts a tuple of values into a responsive map.
 *
 * @param tuple The ordered list of values.
 * @param activeBreakpoints The breakpoints to assign each tuple index to.
 * @returns A responsive value map keyed by breakpoint.
 */
export function tupleToResponsive<T>(
  tuple: readonly T[],
  activeBreakpoints: readonly AnyBreakpoint[],
): ResponsiveValue<T> {
  const out: ResponsiveValue<T> = {};

  for (let i = 0; i < tuple.length; i++) {
    const bp = activeBreakpoints[i];
    if (!bp) break;
    out[bp] = tuple[i];
  }

  return out;
}

/* ============================================================================
 * Raw responsive object detection
 * ==========================================================================*/

/**
 * @function isRawResponsiveObject
 * @description Determines whether a value is a plain responsive object.
 *
 * @param value The value to test.
 * @returns `true` if the value is a responsive breakpoint→value map.
 */
export function isRawResponsiveObject(
  value: unknown,
): value is ResponsiveValue<unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const keys = Object.keys(value);
  if (keys.length === 0) return false;

  return keys.every(isBreakpointKey);
}

/* ============================================================================
 * Responsive expansion
 * ==========================================================================*/

/**
 * @function expandResponsive
 * @description Expands a responsive value into ordered breakpoint/value pairs.
 *
 * @param value The responsive value to expand.
 * @returns A list of breakpoint/value entries in cascade order.
 */
export function expandResponsive<T>(
  value: ResponsiveValue<T>,
): Array<{ breakpoint?: AnyBreakpoint; value: T }> {
  const raw = value as Record<string, unknown>;

  const defaults = extractDefaultEntry<T>(raw);
  const named = extractNamedEntries<T>(raw);
  const dynamicKeys = extractDynamicKeys(raw);
  const dynamic = expandDynamicEntries<T>(raw, dynamicKeys);

  const out = [...defaults, ...named, ...dynamic];
  return out.length ? out : [{ value: value as T }];
}

/* ============================================================================
 * Auto‑wrapping
 * ==========================================================================*/

/**
 * @function autoRs
 * @description Automatically wraps responsive‑capable values.
 *
 * @param value The value to normalize.
 * @param activeBreakpoints The breakpoints used when converting tuples.
 * @returns A wrapped responsive value, or the original value.
 */
export function autoRs(
  value: unknown,
  activeBreakpoints: readonly AnyBreakpoint[],
): unknown {
  if (Array.isArray(value) && activeBreakpoints.length > 0) {
    return rs(tupleToResponsive(value, activeBreakpoints));
  }

  if (isRawResponsiveObject(value)) {
    return rs(value);
  }

  return value;
}

/* ============================================================================
 * Unified responsive expansion
 * ==========================================================================*/

/**
 * @function expandResponsiveValue
 * @description Expands any responsive‑capable value into breakpoint/value pairs.
 *
 * @param raw The value to expand.
 * @param activeBreakpoints Breakpoints used when converting tuples.
 * @returns A list of breakpoint/value entries.
 */
export function expandResponsiveValue(
  raw: unknown,
  activeBreakpoints: readonly AnyBreakpoint[],
): Array<{ breakpoint?: AnyBreakpoint; value: unknown }> {
  if (isResponsive(raw)) {
    return expandResponsive(raw.value);
  }

  if (Array.isArray(raw)) {
    return expandResponsive(tupleToResponsive(raw, activeBreakpoints));
  }

  if (isRawResponsiveObject(raw)) {
    return expandResponsive(raw);
  }

  return [{ value: raw }];
}
