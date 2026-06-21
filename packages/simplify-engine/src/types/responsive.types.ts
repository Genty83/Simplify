/**
 * @module simplify-engine/src/types/responsive
 * @version 1.0.0
 *
 * @description
 * Responsive value contracts for the SimplifyUI engine.
 *
 * This module defines:
 * - `ResponsiveValue<T>` — map‑based responsive syntax
 * - `TupleResponsive<T>` — tuple‑based responsive syntax
 * - `ResponsiveEntry<T>` — a single expanded responsive item
 * - `ExpandResponsiveValue<T>` — fully expanded responsive list
 *
 * These types form the backbone of SimplifyUI’s responsive system.
 * They depend only on:
 * - the canonical breakpoint types
 * - primitive value types
 *
 * This file contains **no runtime logic** and is safe for static analysis.
 */

import type { AnyBreakpoint } from "./breakpoints.types";
import type {
  PrimitiveValue,
  TupleResponsive,
  ResponsiveValue,
  ResponsiveWrapper,
} from "./primitive.types";

// ============================================================================
// Responsive Entry
// ============================================================================

/**
 * @description
 * A single responsive entry after expansion.
 *
 * Example:
 * ```ts
 * { breakpoint: "mobile", value: 12 }
 * ```
 */
export interface ResponsiveEntry<T> {
  breakpoint?: AnyBreakpoint;
  value: T;
}

// ============================================================================
// Fully Expanded Responsive Values
// ============================================================================

/**
 * @description
 * Fully expanded responsive entries.
 *
 * This is the normalized form produced by the responsive compiler.
 */
export type ExpandResponsiveValue<T> = ResponsiveEntry<T>[];

// ============================================================================
// Unified Responsive Input Type
// ============================================================================

/**
 * @description
 * A primitive value that may be responsive.
 *
 * This union matches the engine’s accepted input shapes:
 * - tuple responsive
 * - map responsive
 * - structural responsive wrapper
 */
export type ResponsiveInput<T> =
  | TupleResponsive<PrimitiveValue<T>>
  | ResponsiveValue<PrimitiveValue<T>>
  | ResponsiveWrapper<T>;
