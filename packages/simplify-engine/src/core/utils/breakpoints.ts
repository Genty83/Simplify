/******************************************************************************
 * @module simplify-engine/src/core/utils/breakpoints
 * @version 1.0.0
 * @author Craig Gent
 *
 * @description
 * Breakpoint creation, validation, extraction, and normalization utilities.
 *
 * Responsibilities:
 * - create inline, max, and between breakpoint values
 * - validate breakpoint shapes structurally (no prefix heuristics)
 * - extract numeric values from breakpoint strings
 * - normalize any breakpoint into a structured descriptor
 * - detect container‑media queries
 *
 * Non‑Responsibilities:
 * - generating CSS
 * - building selectors
 * - depending on DOM or environment features
 *
 * Design Principles:
 * - pure and deterministic
 * - rectangular branching (no inference)
 * - pipeline‑based resolvers
 * - runtime‑safe and type‑safe
 * - SSR‑safe, worker‑safe, edge‑safe
 ***************************************************************************** */

import type {
  InlineBreakpoint,
  MaxBreakpoint,
  AnyBreakpoint,
  BetweenBreakpoint,
} from "../../types";

import { defaultBreakpointMap } from "../../config";

/* ============================================================================
 * Constants
 * ==========================================================================*/

const INLINE_PREFIX = "@";
const MAX_PREFIX = "@max:";
const BETWEEN_PREFIX = "@between:";
const CONTAINER_PREFIX = "@container";

const INLINE_SLICE_START = INLINE_PREFIX.length;
const MAX_SLICE_START = MAX_PREFIX.length;

const BETWEEN_PARTS_LENGTH = 3;
const BETWEEN_MIN_INDEX = 1;
const BETWEEN_MAX_INDEX = 2;

// Ordered resolver pipeline (first match wins)
const BREAKPOINT_PIPELINE = [
  resolveInline,
  resolveMax,
  resolveBetweenStep,
  resolveNamed,
] as const;

let breakpointMap: Record<string, number> = { ...defaultBreakpointMap };

/* ============================================================================
 * Error helpers
 * ==========================================================================*/

/**
 * @function throwInvalid
 * @description
 * Throws when a numeric breakpoint value is invalid or non‑finite.
 *
 * Useful for:
 * - validating numeric inputs (e.g., `at(-1)`)
 * - rejecting malformed values early
 *
 * @param value The invalid value encountered.
 * @returns Never — always throws.
 */
function throwInvalid(value: unknown): never {
  throw new Error(`Invalid breakpoint value: ${value}`);
}

/**
 * @function throwMalformed
 * @description
 * Throws when a breakpoint string has the wrong structural format.
 *
 * Useful for:
 * - malformed between breakpoints
 * - malformed inline/max strings
 *
 * @param value The malformed breakpoint string.
 * @returns Never — always throws.
 */
function throwMalformed(value: string): never {
  throw new Error(`Malformed breakpoint format: ${value}`);
}

/**
 * @function throwUnknown
 * @description
 * Throws when a named breakpoint does not exist in the config map.
 *
 * Useful for:
 * - catching typos in named breakpoints
 * - enforcing strict breakpoint naming
 *
 * @param name The unknown breakpoint name.
 * @returns Never — always throws.
 */
function throwUnknown(name: string): never {
  throw new Error(`Unknown named breakpoint: ${name}`);
}

/* ============================================================================
 * Validation helpers
 * ==========================================================================*/

/**
 * @function validateNumber
 * @description Ensures a number is finite and >= 0.
 */
function validateNumber(n: number): number {
  if (!Number.isFinite(n) || n < 0) throwInvalid(n);
  return n;
}

/**
 * @function validateBetweenRange
 * @description Ensures a between-range pair is valid.
 */
function validateBetweenRange(min: number, max: number): void {
  validateNumber(min);
  validateNumber(max);
  if (min >= max) throwMalformed(`${min},${max}`);
}

/**
 * @function validateParts
 * @description Ensures a split string has the expected number of parts.
 */
function validateParts(parts: string[], expected: number, raw: string): void {
  if (parts.length !== expected) throwMalformed(raw);
}

/* ============================================================================
 * Structural type guards (no prefix heuristics)
 * ==========================================================================*/

/**
 * @function isInline
 * @description
 * Determines whether a string is an inline breakpoint.
 *
 * Structural rules:
 * - starts with "@"
 * - contains no colon
 */
function isInline(bp: string): bp is InlineBreakpoint {
  if (bp[0] !== INLINE_PREFIX) {
    return false;
  }

  if (bp.includes(":")) {
    return false;
  }

  return Number.isFinite(Number(bp.slice(INLINE_SLICE_START)));
}

/**
 * @function isMax
 * @description
 * Determines whether a string is a max‑width breakpoint.
 *
 * Structural rules:
 * - starts with "@max:"
 * - contains no additional colons
 */
function isMax(bp: string): bp is MaxBreakpoint {
  return bp.startsWith(MAX_PREFIX) && bp.indexOf(":", MAX_SLICE_START) === -1;
}

/**
 * @function isBetween
 * @description
 * Determines whether a string is a between‑range breakpoint.
 *
 * Structural rules:
 * - starts with "@between:"
 * - splits into exactly 3 parts
 */
function isBetween(bp: string): bp is BetweenBreakpoint {
  return (
    bp.startsWith(BETWEEN_PREFIX) &&
    bp.split(":").length === BETWEEN_PARTS_LENGTH
  );
}

/**
 * @function isNamed
 * @description
 * Determines whether a string is a named breakpoint.
 */
function isNamed(bp: string): boolean {
  return bp in breakpointMap;
}

/**
 * @function isContainerMedia
 * @description
 * Determines whether a value is a valid container‑media query.
 *
 * Structural rules:
 * - must start with "@container"
 * - must contain parentheses
 */
export function isContainerMedia(bp: unknown): bp is string {
  return (
    typeof bp === "string" &&
    bp.startsWith(CONTAINER_PREFIX) &&
    bp.includes("(") &&
    bp.endsWith(")")
  );
}

/* ============================================================================
 * Breakpoint creators
 * ==========================================================================*/

/**
 * @function at
 * @description Creates an inline breakpoint (min‑width).
 *
 * @example
 * at(768) → "@768"
 */
export function at(px: number): InlineBreakpoint {
  return `${INLINE_PREFIX}${validateNumber(px)}` as InlineBreakpoint;
}

/**
 * @function to
 * @description Creates a max‑width breakpoint.
 *
 * @example
 * to(1024) → "@max:1024"
 */
export function to(px: number): MaxBreakpoint {
  return `${MAX_PREFIX}${validateNumber(px)}` as MaxBreakpoint;
}

/**
 * @function between
 * @description Creates a between‑range breakpoint.
 *
 * @example
 * between(600, 900) → "@between:600:900"
 */
export function between(min: number, max: number): BetweenBreakpoint {
  validateBetweenRange(min, max);
  return `${BETWEEN_PREFIX}${min}:${max}` as BetweenBreakpoint;
}

/* ============================================================================
 * Extractors
 * ==========================================================================*/

/**
 * @function extractInline
 * @description Extracts px from an inline breakpoint.
 */
function extractInline(bp: InlineBreakpoint): number {
  return validateNumber(Number(bp.slice(INLINE_SLICE_START)));
}

/**
 * @function extractMax
 * @description Extracts px from a max‑width breakpoint.
 */
function extractMax(bp: MaxBreakpoint): number {
  return validateNumber(Number(bp.slice(MAX_SLICE_START)));
}

/**
 * @function extractBetween
 * @description Extracts `[min, max]` from a between breakpoint.
 */
function extractBetween(bp: BetweenBreakpoint): [number, number] {
  const parts = bp.split(":");
  validateParts(parts, BETWEEN_PARTS_LENGTH, bp);

  const min = Number(parts[BETWEEN_MIN_INDEX]);
  const max = Number(parts[BETWEEN_MAX_INDEX]);

  validateBetweenRange(min, max);
  return [min, max];
}

/* ============================================================================
 * Normalized breakpoint resolver (pipeline)
 * ==========================================================================*/

/**
 * @type ResolvedBreakpoint
 * @description
 * A normalized breakpoint descriptor used by the responsive engine.
 */
export type ResolvedBreakpoint =
  | { type: "min"; min: number }
  | { type: "max"; max: number }
  | { type: "between"; min: number; max: number };

/* --- Resolver steps ------------------------------------------------------- */

/**
 * @function resolveInline
 * @description
 * Resolves an inline breakpoint into a `{ type: "min" }` descriptor.
 *
 * @param bp The breakpoint value to inspect.
 * @returns A resolved inline descriptor, or `null` if not inline.
 */
function resolveInline(bp: AnyBreakpoint): ResolvedBreakpoint | null {
  return isInline(bp) ? { type: "min", min: extractInline(bp) } : null;
}

/**
 * @function resolveMax
 * @description
 * Resolves a max‑width breakpoint into a `{ type: "max" }` descriptor.
 *
 * @param bp The breakpoint value to inspect.
 * @returns A resolved max descriptor, or `null` if not max‑width.
 */
function resolveMax(bp: AnyBreakpoint): ResolvedBreakpoint | null {
  return isMax(bp) ? { type: "max", max: extractMax(bp) } : null;
}

/**
 * @function resolveBetweenStep
 * @description
 * Resolves a between‑range breakpoint into a `{ type: "between" }` descriptor.
 *
 * @param bp The breakpoint value to inspect.
 * @returns A resolved between descriptor, or `null` if not between‑range.
 */
function resolveBetweenStep(bp: AnyBreakpoint): ResolvedBreakpoint | null {
  if (!isBetween(bp)) return null;
  const [min, max] = extractBetween(bp);
  return { type: "between", min, max };
}

/**
 * @function resolveNamed
 * @description
 * Resolves a named breakpoint into a `{ type: "min" }` descriptor using
 * the configured breakpoint map.
 *
 * @param bp The breakpoint value to inspect.
 * @returns A resolved named descriptor, or `null` if not a named breakpoint.
 */
function resolveNamed(bp: AnyBreakpoint): ResolvedBreakpoint | null {
  return isNamed(bp) ? { type: "min", min: breakpointMap[bp] } : null;
}

/* --- Pipeline ------------------------------------------------------------- */

/**
 * @function resolveBreakpoint
 * @description
 * Normalizes any breakpoint into a structured descriptor using a
 * pipeline of resolvers instead of branching.
 *
 * @example
 * resolveBreakpoint("@768") → { type: "min", min: 768 }
 */
export function resolveBreakpoint(bp: AnyBreakpoint): ResolvedBreakpoint {
  for (const step of BREAKPOINT_PIPELINE) {
    const result = step(bp);
    if (result) return result;
  }

  throwUnknown(String(bp));
}

/* ============================================================================
 * Public breakpoint configuration API
 * ==========================================================================*/

/**
 * @function getBreakpoints
 * @description
 * Returns a shallow copy of the current runtime breakpoint map.
 *
 * @returns {Record<string, number>}
 *   The active breakpoint map.
 */
export function getBreakpoints(): Record<string, number> {
  return { ...breakpointMap };
}

/**
 * @function setBreakpoints
 * @description
 * Merges user-defined breakpoints into the existing breakpoint map.
 *
 * Structural rules:
 * - partial overrides allowed
 * - new keys allowed
 * - values must be finite numbers >= 0
 *
 * @param {Partial<Record<keyof typeof defaultBreakpointMap, number>> & Record<string, number>} map
 *   The user-defined breakpoint overrides.
 *
 * @returns {void}
 */
export function setBreakpoints(
  map: Partial<Record<keyof typeof defaultBreakpointMap, number>> &
    Record<string, number>,
): void {
  Object.entries(map).forEach(([key, value]) => {
    validateNumber(value);
    breakpointMap[key] = value;
  });
}

/**
 * @function defineBreakpoint
 * @description
 * Adds or updates a single breakpoint entry.
 *
 * @param {string} name
 *   The breakpoint name.
 *
 * @param {number} px
 *   The minimum width in pixels.
 *
 * @returns {void}
 */
export function defineBreakpoint(name: string, px: number): void {
  if (!Number.isFinite(px) || px < 0) {
    throw new Error(`Invalid breakpoint value: ${px}`);
  }
  breakpointMap[name] = px;
}

/**
 * @function resetBreakpoints
 * @description
 * Restores the canonical breakpoint map.
 *
 * @returns {void}
 */
export function resetBreakpoints(): void {
  breakpointMap = { ...defaultBreakpointMap };
}