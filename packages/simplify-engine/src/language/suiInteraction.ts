/******************************************************************************
 * SimplifyUI Interaction Utility
 * @module simplify-engine/src/language/suiInteraction
 *
 * @description
 * The Interaction utility for the SimplifyUI design system.
 *
 * This module defines the `suiInteraction` utility — one of the seven core UI
 * design primitives in Simplify:
 *
 * - layout
 * - surface
 * - shape
 * - motion
 * - sizing
 * - typography
 * - interaction   ← this module
 *
 * The interaction utility controls interactive affordances such as:
 * - cursor
 * - pointer events
 * - user-select
 * - touch-action
 * - visibility
 * - opacity (interaction-driven)
 *
 * All properties support:
 * - primitive values (string | number)
 * - responsive values
 * - state wrappers
 * - container wrappers
 *
 * @example
 * const cls = suiInteraction({
 *   cursor: { hover: "pointer" },
 *   userSelect: "none"
 * }).atomize();
 ***************************************************************************** */

import type * as CSS from "csstype";
import type {
  SuiValue,
  Breakpoint,
  InlineBreakpoint,
  StateKey,
} from "../types";

import { registerUtility, createSuiUtility } from "../utilities";

// ============================================================================
// Interaction Props
// ============================================================================

/**
 * @description
 * Props accepted by the `suiInteraction` utility.
 * Each property supports:
 * - primitive values
 * - responsive arrays/objects
 * - state wrappers
 * - container wrappers
 */
export interface SuiInteractionProps {
  //
  // Cursor
  //
  cursor?: SuiValue<CSS.Property.Cursor>;

  //
  // Pointer / selection
  //
  pointerEvents?: SuiValue<CSS.Property.PointerEvents>;
  userSelect?: SuiValue<CSS.Property.UserSelect>;
  touchAction?: SuiValue<CSS.Property.TouchAction>;

  //
  // Visibility / opacity
  //
  visibility?: SuiValue<CSS.Property.Visibility>;
  opacity?: SuiValue<CSS.Property.Opacity>;

  //
  // Meta
  //
  usingBreakpoints?: Array<Breakpoint | InlineBreakpoint>;
  usingStates?: StateKey[];
  usingContainers?: unknown; // container support is inherited from createSuiUtility
}

// ============================================================================
// suiInteraction() Utility
// ============================================================================

/**
 * @description
 * High‑level SUI interaction utility.
 *
 * Wraps the low‑level `createUtility("interaction")` compiler with:
 * - semantic → CSS property mapping (none needed here)
 * - responsive normalization (`autoRs`)
 * - state expansion
 * - container query support
 *
 * @example
 * const cls = suiInteraction({
 *   cursor: { hover: "pointer" },
 *   opacity: ["1", "0.8"]
 * }).atomize();
 *
 * @returns A `UtilityResult` containing atomic rules + `.atomize()`.
 */
export const suiInteraction =
  createSuiUtility<SuiInteractionProps>("interaction");

// ============================================================================
// Registration
// ============================================================================

/** Registers the interaction utility in the global utility registry. */
registerUtility("interaction", suiInteraction);
