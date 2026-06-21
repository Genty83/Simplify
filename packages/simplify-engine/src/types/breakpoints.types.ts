/**
 * @module simplify-engine/src/types/breakpoints
 * @version 1.0.0
 *
 * @description
 * Canonical breakpoint type system for the SimplifyUI engine.
 *
 * This module defines:
 * - The immutable breakpoint scale
 * - All inline and range‑based breakpoint syntaxes
 * - The union type `AnyBreakpoint`
 * - The `BreakpointGraph` structure used by responsive expansion
 *
 * These types form the foundation of the responsive system and intentionally
 * contain **no imports** to avoid circular dependencies.
 *
 * This file is purely declarative and safe for static analysis.
 */

// ============================================================================
// Breakpoint Scale
// ============================================================================

/**
 * @description
 * The canonical breakpoint scale used by SimplifyUI.
 *
 * These represent viewport‑based breakpoints and are used throughout the
 * responsive system.
 */
export const breakpoints = [
  "mobile",
  "tablet",
  "laptop",
  "desktop",
  "monitor",
  "wide",
] as const;

/**
 * @description
 * A named breakpoint from the canonical scale.
 */
export type Breakpoint = (typeof breakpoints)[number];

// ============================================================================
// Inline Syntax
// ============================================================================

/**
 * @description
 * Inline breakpoint syntax: `@600` means “min‑width: 600px”.
 */
export type InlineBreakpoint = `@${number}`;

/**
 * @description
 * Max‑width breakpoint syntax: `@max:900` means “max‑width: 900px”.
 */
export type MaxBreakpoint = `@max:${number}`;

/**
 * @description
 * Between breakpoint syntax: `@between:600:900` means “600px → 900px”.
 */
export type BetweenBreakpoint = `@between:${number}:${number}`;

// ============================================================================
// Unified Breakpoint Type
// ============================================================================

/**
 * @description
 * Any valid breakpoint syntax supported by the engine.
 */
export type AnyBreakpoint =
  | Breakpoint
  | InlineBreakpoint
  | MaxBreakpoint
  | BetweenBreakpoint;

/**
 * @description
 * Immutable list of breakpoints used to generate responsive rules.
 */
export type BreakpointGraph = readonly AnyBreakpoint[];
