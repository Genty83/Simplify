/******************************************************************************
 * @module simplify-engine/src/types/primitives
 * @version 1.0.0
 *
 * @description
 * Primitive value contracts for the SimplifyUI engine.
 *
 * This module defines:
 * - `PrimitiveValue<T>` — the core atomic value accepted by the engine
 * - `ResponsivePrimative<T>` — tuple or map‑based responsive primitives
 * - `ResponsiveWrapper<T>` — structural wrapper for responsive values
 * - `SuiValue<T>` — unified semantic value type
 *
 * These types intentionally contain **no imports** to avoid dependency cycles.
 * They form the lowest‑level value layer used by responsive, stateful, and
 * atomic‑rule systems.
 *
 * This file is purely declarative and safe for static analysis.
 ***************************************************************************** */

import type { PaintValue } from "../paintApi";
import type { AnyBreakpoint } from "./breakpoints.types";
import type { StateWrapper } from "./states.types";

// ============================================================================
// Primitive Values
// ============================================================================

/**
 * @description
 * A primitive value accepted by the engine:
 * - raw type `T`
 * - numeric values
 * - paint tokens
 */
export type PrimitiveValue<T> = T | number | PaintValue;

// ============================================================================
// Responsive Primitive Values
// ============================================================================

/**
 * @description
 * Tuple‑based responsive syntax:
 *
 * Example:
 * ```ts
 * [12, 16, 20] // mobile → tablet → laptop
 * ```
 */
export type TupleResponsive<T> = readonly T[];

/**
 * @description
 * Map‑based responsive syntax:
 *
 * Example:
 * ```ts
 * { default: 12, mobile: 10, desktop: 16 }
 * ```
 *
 * This is intentionally untyped at the breakpoint level to avoid imports.
 */
export type ResponsiveValue<T> = Partial<Record<AnyBreakpoint | "default", T>>;

/**
 * @description
 * A primitive value that may be responsive.
 */
export type ResponsivePrimitive<T> =
  | TupleResponsive<PrimitiveValue<T>>
  | ResponsiveValue<PrimitiveValue<T>>;

// ============================================================================
// Responsive Wrapper
// ============================================================================

/**
 * @description
 * Structural wrapper marking a value as responsive.
 */
export interface ResponsiveWrapper<T> {
  __responsive: true;
  value: ResponsiveValue<PrimitiveValue<T>>;
}

// ============================================================================
// SuiValue — Unified Semantic Value Type
// ============================================================================

/**
 * @description
 * Any value accepted by the Simplify engine:
 * - primitive
 * - responsive
 * - responsive wrapper
 * - state wrapper
 */
export type SuiValue<T> =
  | PrimitiveValue<T>
  | ResponsivePrimitive<T>
  | ResponsiveWrapper<T>
  | StateWrapper<any>;
