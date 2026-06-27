/**
 * @module simplify-engine/src/language/suiMotion
 *
 * @description
 * The Motion utility for the SimplifyUI design system.
 *
 * This module defines the `suiMotion` utility — one of the seven core UI
 * design primitives in Simplify:
 *
 * - layout
 * - surface
 * - shape
 * - motion   ← this module
 * - sizing
 * - typography
 * - interaction
 *
 * The motion utility controls *temporal* and *transform* properties:
 *
 * - transitions (properties, duration, timing, delay)
 * - animations (name, duration, timing, iteration, direction, fill)
 * - transforms (translate, scale, rotate, skew)
 * - transform origin
 *
 * All properties support:
 * - primitive values (string | number)
 * - responsive objects
 * - state wrappers
 * - container wrappers
 *
 * @example
 * const cls = suiMotion({
 *   transitionProperty: "background-color, transform",
 *   transitionDuration: 150,
 *   transitionTimingFunction: "ease-out",
 *   transform: { hover: "scale(1.03)" }
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
 * Motion Props
 * ==========================================================================*/

export interface SuiMotionProps {
  //
  // Transition
  //
  transitionProperty?: SuiValue<CSS.Property.TransitionProperty>;
  transitionDuration?: SuiValue<CSS.Property.TransitionDuration>;
  transitionTimingFunction?: SuiValue<CSS.Property.TransitionTimingFunction>;
  transitionDelay?: SuiValue<CSS.Property.TransitionDelay>;
  transition?: SuiValue<CSS.Property.Transition>;

  //
  // Animation
  //
  animationName?: SuiValue<CSS.Property.AnimationName>;
  animationDuration?: SuiValue<CSS.Property.AnimationDuration>;
  animationTimingFunction?: SuiValue<CSS.Property.AnimationTimingFunction>;
  animationDelay?: SuiValue<CSS.Property.AnimationDelay>;
  animationIterationCount?: SuiValue<CSS.Property.AnimationIterationCount>;
  animationDirection?: SuiValue<CSS.Property.AnimationDirection>;
  animationFillMode?: SuiValue<CSS.Property.AnimationFillMode>;
  animationPlayState?: SuiValue<CSS.Property.AnimationPlayState>;
  animation?: SuiValue<CSS.Property.Animation>;

  //
  // Transform
  //
  transform?: SuiValue<CSS.Property.Transform>;
  transformOrigin?: SuiValue<CSS.Property.TransformOrigin>;
  transformBox?: SuiValue<CSS.Property.TransformBox>;

  //
  // Meta
  //
  usingBreakpoints?: Array<Breakpoint | InlineBreakpoint>;
  usingStates?: StateKey[];
}

/* ============================================================================
 * suiMotion() Utility
 * ==========================================================================*/

/**
 * @description
 * High‑level SUI motion utility.
 *
 * Wraps `createUtility("motion")` with:
 * - responsive expansion
 * - state expansion
 * - container query support
 */
export const suiMotion = createSuiUtility<SuiMotionProps>("motion");

/* ============================================================================
 * Registration
 * ==========================================================================*/

registerUtility("motion", suiMotion);

