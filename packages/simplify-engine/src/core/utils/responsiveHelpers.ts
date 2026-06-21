/******************************************************************************
 * @module SimplifyUI/core/utils/responsiveHelpers
 * @version 1.0.0
 * @author
 *   Craig Gent
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
 * Internal helpers
 * ==========================================================================*/

function isNamedBreakpoint(key: string): key is Breakpoint {
  return key in defaultBreakpointMap;
}

function isBetweenKey(key: string): boolean {
  return key.startsWith(PREFIX_BETWEEN);
}

function isMaxKey(key: string): boolean {
  return key.startsWith(PREFIX_MAX);
}

function isInlineKey(key: string): boolean {
  if (!key.startsWith(PREFIX_INLINE)) return false;
  if (isBetweenKey(key)) return false;
  if (isMaxKey(key)) return false;

  // MUST be numeric only
  const raw = key.slice(PREFIX_INLINE.length);
  return /^\d+$/.test(raw);
}


function parseNumberOrNull(raw: string): number | null {
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

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
  if (isNamedBreakpoint(key)) return true;
  if (isBetweenKey(key)) return true;
  if (isMaxKey(key)) return true;
  if (isInlineKey(key)) return true;
  return false;
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
  if (!isInlineKey(key)) return null;
  return parseNumberOrNull(key.slice(PREFIX_INLINE.length));
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
 * - named breakpoints resolved via `defaultBreakpointMap`
 * - inline, max, and between keys parsed deterministically
 * - unparseable keys resolve to `0`
 *
 * @param bp The breakpoint key to resolve.
 * @returns The resolved pixel value.
 */
export function resolveBreakpointToPx(bp: string): number {
  if (isNamedBreakpoint(bp)) {
    return defaultBreakpointMap[bp];
  }

  if (isBetweenKey(bp)) {
    const [, min] = bp.split(":");
    return parseNumberOrNull(min) ?? 0;
  }

  if (isMaxKey(bp)) {
    const raw = bp.slice(PREFIX_MAX.length);
    return parseNumberOrNull(raw) ?? 0;
  }

  if (isInlineKey(bp)) {
    const raw = bp.slice(PREFIX_INLINE.length);
    return parseNumberOrNull(raw) ?? 0;
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
    if (isNamedBreakpoint(key)) return false;
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
 * - does not mutate the input keys array
 *
 * @param raw The responsive value map.
 * @param keys The dynamic breakpoint keys.
 * @returns Ordered dynamic breakpoint/value pairs.
 */
export function expandDynamicEntries<T>(
  raw: Record<string, unknown>,
  keys: string[],
): Array<{ breakpoint: AnyBreakpoint; value: T }> {
  const sorted = [...keys].sort(
    (a, b) => resolveBreakpointToPx(a) - resolveBreakpointToPx(b),
  );

  return sorted.map((key) => ({
    breakpoint: key as AnyBreakpoint,
    value: raw[key] as T,
  }));
}
