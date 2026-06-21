/******************************************************************************
 * @module SimplifyUI/core/utils/responsiveHelpers
 * @version 1.0.0
 * @author Craig Gent
 *
 * @description
 * Internal responsive helpers used by the SimplifyUI responsive engine.
 *
 * Responsibilities:
 * - breakpoint key detection
 * - inline breakpoint parsing
 * - breakpoint → px resolution
 * - responsive entry extraction (default, named, dynamic)
 * - dynamic breakpoint expansion
 *
 * Non‑Responsibilities:
 * - creating wrappers
 * - mutating user input
 * - orchestrating responsive expansion
 *
 * Design Principles:
 * - pure deterministic helpers
 * - minimal branching (rectangular logic)
 * - no magic numbers or hidden invariants
 * - structural, SSR‑safe
 ***************************************************************************** */

import { breakpoints } from "../../types";
import { defaultBreakpointMap } from "../../config";
import type { AnyBreakpoint, Breakpoint } from "../../types";

/* ============================================================================
 * Constants
 * ==========================================================================*/

const PREFIX_INLINE = "@";
const PREFIX_MAX = "@max:";
const PREFIX_BETWEEN = "@between:";
const KEY_DEFAULT = "default";

/* ============================================================================
 * Breakpoint key detection
 * ==========================================================================*/

/**
 * @function isBreakpointKey
 * @description
 * Determines whether a string is a valid SimplifyUI breakpoint key.
 *
 * Structural rules:
 * - accepts named breakpoints
 * - accepts inline (`@600`)
 * - accepts max (`@max:800`)
 * - accepts between (`@between:600:900`)
 *
 * @param key The candidate breakpoint key.
 * @returns `true` if the key matches any supported breakpoint format.
 */
export function isBreakpointKey(key: string): boolean {
  return (
    key in defaultBreakpointMap ||
    key.startsWith(PREFIX_INLINE) ||
    key.startsWith(PREFIX_MAX) ||
    key.startsWith(PREFIX_BETWEEN)
  );
}

/* ============================================================================
 * Inline breakpoint parsing
 * ==========================================================================*/

/**
 * @function parseInlineBreakpoint
 * @description
 * Parses an inline breakpoint (e.g. `@600`) into a numeric pixel value.
 *
 * Structural rules:
 * - only parses inline (`@NNN`)
 * - returns `null` for non‑inline keys
 *
 * @param key The breakpoint string to parse.
 * @returns The numeric pixel value, or `null` if not inline.
 */
export function parseInlineBreakpoint(key: string): number | null {
  if (!key.startsWith(PREFIX_INLINE)) return null;
  const px = Number(key.slice(PREFIX_INLINE.length));
  return Number.isFinite(px) ? px : null;
}

/* ============================================================================
 * Breakpoint → px resolution (rectangular logic)
 * ==========================================================================*/

/**
 * @function resolveBreakpointToPx
 * @description
 * Converts any breakpoint key into a numeric pixel value for sorting.
 *
 * Structural rules:
 * - rectangular branching (no nested conditionals)
 * - named breakpoints resolved via `breakpointMap`
 * - inline, max, and between keys parsed deterministically
 * - unparseable keys resolve to `0`
 *
 * @param bp The breakpoint key to resolve.
 * @returns The resolved pixel value.
 */
export function resolveBreakpointToPx(bp: string): number {
  if (bp in defaultBreakpointMap) {
    return defaultBreakpointMap[bp as Breakpoint];
  }

  if (bp.startsWith(PREFIX_INLINE)) {
    return Number(bp.slice(PREFIX_INLINE.length)) || 0;
  }

  if (bp.startsWith(PREFIX_MAX)) {
    return Number(bp.slice(PREFIX_MAX.length)) || 0;
  }

  if (bp.startsWith(PREFIX_BETWEEN)) {
    const [, min] = bp.split(":");
    return Number(min) || 0;
  }

  return 0;
}

/* ============================================================================
 * Responsive entry extraction
 * ==========================================================================*/

/**
 * @function extractDefaultEntry
 * @description
 * Extracts the `default` entry from a responsive object.
 *
 * Structural rules:
 * - returns empty array if no default
 * - never mutates input
 *
 * @param raw The responsive value map.
 * @returns A list containing the default entry (if present).
 */
export function extractDefaultEntry<T>(
  raw: Record<string, unknown>,
): Array<{ breakpoint?: AnyBreakpoint; value: T }> {
  return raw[KEY_DEFAULT] !== undefined
    ? [{ value: raw[KEY_DEFAULT] as T }]
    : [];
}

/**
 * @function extractNamedEntries
 * @description
 * Extracts named breakpoint entries in canonical order.
 *
 * Structural rules:
 * - iterates in `breakpoints` order
 * - skips undefined entries
 *
 * @param raw The responsive value map.
 * @returns Ordered named breakpoint/value pairs.
 */
export function extractNamedEntries<T>(
  raw: Record<string, unknown>,
): Array<{ breakpoint: AnyBreakpoint; value: T }> {
  const out: Array<{ breakpoint: AnyBreakpoint; value: T }> = [];

  for (const bp of breakpoints) {
    if (raw[bp] !== undefined) {
      out.push({ breakpoint: bp, value: raw[bp] as T });
    }
  }

  return out;
}

/**
 * @function extractDynamicKeys
 * @description
 * Extracts dynamic breakpoint keys (inline, max, between).
 *
 * Structural rules:
 * - excludes `default`
 * - excludes named breakpoints
 * - includes only valid dynamic keys
 *
 * @param raw The responsive value map.
 * @returns A list of dynamic breakpoint keys.
 */
export function extractDynamicKeys(raw: Record<string, unknown>): string[] {
  return Object.keys(raw).filter((key) => {
    if (key === KEY_DEFAULT) return false;
    if (breakpoints.includes(key as Breakpoint)) return false;
    return isBreakpointKey(key);
  });
}

/**
 * @function expandDynamicEntries
 * @description
 * Expands dynamic breakpoint keys into sorted breakpoint/value pairs.
 *
 * Structural rules:
 * - sorted by resolved px value
 * - stable deterministic ordering
 *
 * @param raw The responsive value map.
 * @param keys The dynamic breakpoint keys.
 * @returns Ordered dynamic breakpoint/value pairs.
 */
export function expandDynamicEntries<T>(
  raw: Record<string, unknown>,
  keys: string[],
): Array<{ breakpoint: AnyBreakpoint; value: T }> {
  const sorted = keys.sort(
    (a, b) => resolveBreakpointToPx(a) - resolveBreakpointToPx(b),
  );

  return sorted.map((key) => ({
    breakpoint: key as AnyBreakpoint,
    value: raw[key] as T,
  }));
}
