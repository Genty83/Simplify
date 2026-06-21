/**
 * @module simplify-engine/src/language/suiTypography
 *
 * @description
 * The Typography utility for the SimplifyUI design system.
 *
 * This module defines the `suiTypography` utility — one of the seven core UI
 * design primitives in Simplify:
 *
 * - layout
 * - surface
 * - shape
 * - motion
 * - sizing
 * - typography   ← this module
 * - interaction
 *
 * The typography utility controls all *textual* and *font* properties:
 *
 * - font family
 * - font size
 * - font weight
 * - line height
 * - letter spacing
 * - text alignment
 * - text transform
 * - text decoration
 * - white-space handling
 *
 * All properties support:
 * - primitive values (string | number)
 * - responsive objects
 * - state wrappers
 * - container wrappers
 * - token resolution (via paint or custom token maps)
 *
 * @example
 * const cls = suiTypography({
 *   fontSize: { mobile: "14px", desktop: "16px" },
 *   fontWeight: 600,
 *   lineHeight: 1.4
 * }).atomize();
 */

import type * as CSS from "csstype";
import type {
  SuiValue,
  Breakpoint,
  InlineBreakpoint,
  StateKey,
  AnyContainerBreakpoint
} from "../types";
import { registerUtility, createSuiUtility } from "../utilities";

/* ============================================================================
 * Typography Props
 * ==========================================================================*/

/**
 * @description
 * Full set of typography‑related properties supported by the Simplify
 * typography utility. This interface is intentionally comprehensive and
 * future‑proof, covering the entire CSS typography specification.
 */
export interface SuiTypographyProps {
  //
  // Font family
  //
  fontFamily?: SuiValue<CSS.Property.FontFamily>;

  //
  // Font size / weight / style
  //
  fontSize?: SuiValue<CSS.Property.FontSize>;
  fontWeight?: SuiValue<CSS.Property.FontWeight>;
  fontStyle?: SuiValue<CSS.Property.FontStyle>;
  fontVariant?: SuiValue<CSS.Property.FontVariant>;

  //
  // Line height / letter spacing
  //
  lineHeight?: SuiValue<CSS.Property.LineHeight>;
  letterSpacing?: SuiValue<CSS.Property.LetterSpacing>;

  //
  // Text alignment / transform / decoration
  //
  textAlign?: SuiValue<CSS.Property.TextAlign>;
  textTransform?: SuiValue<CSS.Property.TextTransform>;
  textDecoration?: SuiValue<CSS.Property.TextDecoration>;
  textDecorationColor?: SuiValue<CSS.Property.TextDecorationColor>;
  textDecorationThickness?: SuiValue<CSS.Property.TextDecorationThickness>;
  textUnderlineOffset?: SuiValue<CSS.Property.TextUnderlineOffset>;

  //
  // White-space / overflow
  //
  whiteSpace?: SuiValue<CSS.Property.WhiteSpace>;
  textOverflow?: SuiValue<CSS.Property.TextOverflow>;
  wordBreak?: SuiValue<CSS.Property.WordBreak>;
  overflowWrap?: SuiValue<CSS.Property.OverflowWrap>;

  //
  // Meta
  //
  usingBreakpoints?: Array<Breakpoint | InlineBreakpoint>;
  usingStates?: StateKey[];
  usingContainers?: AnyContainerBreakpoint[];
}

/* ============================================================================
 * suiTypography() Utility
 * ==========================================================================*/

/**
 * @description
 * High‑level SUI typography utility.
 *
 * This wraps the low‑level `createUtility("typography")` compiler with:
 * - automatic responsive expansion
 * - state expansion
 * - container query support
 *
 * @example
 * const cls = suiTypography({
 *   fontSize: ["14px", "16px"],
 *   fontWeight: { hover: 700 }
 * }).atomize();
 */
export const suiTypography = createSuiUtility<SuiTypographyProps>("typography");

/* ============================================================================
 * Registration
 * ==========================================================================*/

registerUtility("typography", suiTypography);

/**
 * @description
 * Module augmentation so `suiSheet()` recognizes `typography` as a valid utility.
 */
declare module "../types" {
  interface RegisteredUtilities {
    typography: SuiTypographyProps;
  }
}
