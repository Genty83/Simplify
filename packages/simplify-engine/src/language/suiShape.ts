/**
 * @module simplify-engine/src/language/suiShape
 *
 * @description
 * The Shape utility for the SimplifyUI design system.
 *
 * This module defines the `suiShape` utility — one of the seven core UI
 * design primitives in Simplify:
 *
 * - layout
 * - surface
 * - shape   ← this module
 * - motion
 * - sizing
 * - typography
 * - interaction
 *
 * The shape utility controls all *geometric* and *corner‑related* properties:
 *
 * - border radius (all corners or individual)
 * - outline radius
 * - clip‑path
 * - shape‑outside
 * - corner smoothing
 *
 * All properties support:
 * - primitive values (string | number)
 * - responsive objects
 * - state wrappers
 * - container wrappers
 *
 * @example
 * const cls = suiShape({
 *   borderRadius: { mobile: 8, desktop: 12 },
 *   clipPath: "inset(0 round 12px)"
 * }).atomize();
 */

import type * as CSS from "csstype";
import type {
  SuiValue,
  Breakpoint,
  InlineBreakpoint,
  StateKey
} from "../types";
import { registerUtility, createSuiUtility } from "../utilities";

/* ============================================================================
 * Shape Props
 * ==========================================================================*/

/**
 * @description
 * Full set of shape‑related properties supported by the Simplify shape utility.
 * This interface is intentionally comprehensive and future‑proof, covering the
 * entire CSS geometry and corner specification.
 */
export interface SuiShapeProps {
  //
  // Border radius (all corners)
  //
  borderRadius?: SuiValue<CSS.Property.BorderRadius>;

  //
  // Individual corner radii
  //
  borderTopLeftRadius?: SuiValue<CSS.Property.BorderTopLeftRadius>;
  borderTopRightRadius?: SuiValue<CSS.Property.BorderTopRightRadius>;
  borderBottomRightRadius?: SuiValue<CSS.Property.BorderBottomRightRadius>;
  borderBottomLeftRadius?: SuiValue<CSS.Property.BorderBottomLeftRadius>;

  //
  // Outline radius (CSS spec)
  //
  outlineRadius?: SuiValue<CSS.Property.OutlineWidth>; // outline-radius is not in csstype yet

  //
  // Clip path
  //
  clipPath?: SuiValue<CSS.Property.ClipPath>;

  //
  // Shape outside (float shapes)
  //
  shapeOutside?: SuiValue<CSS.Property.ShapeOutside>;
  shapeMargin?: SuiValue<CSS.Property.ShapeMargin>;

  //
  // Corner smoothing (CSS spec, Safari/WebKit)
  //
  borderStartStartRadius?: SuiValue<CSS.Property.BorderStartStartRadius>;
  borderStartEndRadius?: SuiValue<CSS.Property.BorderStartEndRadius>;
  borderEndStartRadius?: SuiValue<CSS.Property.BorderEndStartRadius>;
  borderEndEndRadius?: SuiValue<CSS.Property.BorderEndEndRadius>;

  //
  // Meta
  //
  usingBreakpoints?: Array<Breakpoint | InlineBreakpoint>;
  usingStates?: StateKey[];
}

/* ============================================================================
 * suiShape() Utility
 * ==========================================================================*/

/**
 * @description
 * High‑level SUI shape utility.
 *
 * This wraps the low‑level `createUtility("shape")` compiler with:
 * - automatic responsive expansion
 * - state expansion
 * - container query support
 *
 * @example
 * const cls = suiShape({
 *   borderRadius: ["4px", "8px", "12px"],
 *   clipPath: { hover: "circle(50%)" }
 * }).atomize();
 */
export const suiShape = createSuiUtility<SuiShapeProps>("shape");

/* ============================================================================
 * Registration
 * ==========================================================================*/

registerUtility("shape", suiShape);

/**
 * @description
 * Module augmentation so `suiSheet()` recognizes `shape` as a valid utility.
 */
declare module "../types" {
  interface RegisteredUtilities {
    shape: SuiShapeProps;
  }
}
