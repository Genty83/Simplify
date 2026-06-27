/**
 * @module simplify-engine/src/language/suiSizing
 *
 * @description
 * The Sizing utility for the SimplifyUI design system.
 *
 * This module defines the `suiSizing` utility — one of the seven core UI
 * design primitives in Simplify:
 *
 * - layout
 * - surface
 * - shape
 * - motion
 * - sizing   ← this module
 * - typography
 * - interaction
 *
 * The sizing utility provides a strongly‑typed, responsive, stateful,
 * container‑aware API for all CSS sizing properties, including:
 *
 * - width / height
 * - min/max dimensions
 * - logical sizing (inline/block)
 * - aspect ratio
 * - object sizing (fit/position)
 * - overflow
 * - box sizing
 * - shorthand `size`
 *
 * All properties support:
 * - primitive values (string | number)
 * - responsive objects
 * - state wrappers
 * - container wrappers (via `suiSheet`)
 * - paint tokens (if used in borders/outlines)
 *
 * @example
 * const cls = suiSizing({
 *   width: { mobile: "100%", desktop: 480 },
 *   height: 200,
 *   maxWidth: "80vw"
 * }).atomize();
 *
 * element.className = cls;
 */

import type * as CSS from "csstype";
import type { SuiValue, Breakpoint, InlineBreakpoint, StateKey } from "../types";
import { registerUtility, createSuiUtility } from "../utilities";

/* ============================================================================
 * Sizing Props
 * ==========================================================================*/

/**
 * @description
 * Full set of sizing‑related properties supported by the Simplify sizing
 * utility. This interface is intentionally comprehensive and future‑proof,
 * covering the entire CSS sizing specification.
 *
 * All properties accept `SuiValue<T>`, enabling:
 * - responsive values
 * - stateful values
 * - container‑aware values
 * - normalization
 * - paint token resolution (where applicable)
 */
export interface SuiSizingProps {
  //
  // Core dimensions
  //
  width?: SuiValue<CSS.Property.Width>;
  height?: SuiValue<CSS.Property.Height>;

  minWidth?: SuiValue<CSS.Property.MinWidth>;
  minHeight?: SuiValue<CSS.Property.MinHeight>;

  maxWidth?: SuiValue<CSS.Property.MaxWidth>;
  maxHeight?: SuiValue<CSS.Property.MaxHeight>;

  //
  // Logical sizing (writing‑mode aware)
  //
  inlineSize?: SuiValue<CSS.Property.InlineSize>;
  blockSize?: SuiValue<CSS.Property.BlockSize>;

  minInlineSize?: SuiValue<CSS.Property.MinInlineSize>;
  minBlockSize?: SuiValue<CSS.Property.MinBlockSize>;

  maxInlineSize?: SuiValue<CSS.Property.MaxInlineSize>;
  maxBlockSize?: SuiValue<CSS.Property.MaxBlockSize>;

  //
  // Aspect ratio
  //
  aspectRatio?: SuiValue<CSS.Property.AspectRatio>;

  //
  // Box sizing
  //
  boxSizing?: SuiValue<CSS.Property.BoxSizing>;

  //
  // Object sizing (images, videos, media)
  //
  objectFit?: SuiValue<CSS.Property.ObjectFit>;
  objectPosition?: SuiValue<CSS.Property.ObjectPosition>;

  //
  // Overflow (often grouped with sizing/layout)
  //
  overflow?: SuiValue<CSS.Property.Overflow>;
  overflowX?: SuiValue<CSS.Property.OverflowX>;
  overflowY?: SuiValue<CSS.Property.OverflowY>;

  //
  // Shorthand
  //
  size?: SuiValue<CSS.Property.Width | CSS.Property.Height>;

  //
  // Meta
  //
  usingBreakpoints?: Array<Breakpoint | InlineBreakpoint>;
  usingStates?: StateKey[];
}

/* ============================================================================
 * suiSizing() Utility
 * ==========================================================================*/

/**
 * @description
 * High‑level SUI sizing utility.
 *
 * This wraps the low‑level `createUtility("sizing")` compiler with:
 * - automatic responsive expansion (`autoRs`)
 * - meta‑field extraction
 * - container query support
 *
 * @example
 * const cls = suiSizing({
 *   width: { mobile: "100%", desktop: 480 },
 *   height: 200,
 *   maxWidth: "80vw"
 * }).atomize();
 */
export const suiSizing = createSuiUtility<SuiSizingProps>("sizing");

/* ============================================================================
 * Registration
 * ==========================================================================*/

registerUtility("sizing", suiSizing);
