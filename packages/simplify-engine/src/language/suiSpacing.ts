/**
 * @module simplify-engine/src/language/suiSpacing
 *
 * @description
 * Spacing utility for the SimplifyUI design system.
 *
 * This module defines the `suiSpacing` utility — responsible for margin,
 * padding, and logical spacing properties.
 *
 * All properties support:
 * - primitive values (string | number)
 * - responsive objects
 * - state wrappers
 * - container wrappers
 *
 * @example
 * const cls = suiSpacing({
 *   padding: { mobile: 8, desktop: 24 },
 *   marginTop: 16
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
 * Spacing Props
 * ==========================================================================*/

export interface SuiSpacingProps {
  //
  // Padding
  //
  padding?: SuiValue<CSS.Property.Padding>;
  paddingTop?: SuiValue<CSS.Property.PaddingTop>;
  paddingRight?: SuiValue<CSS.Property.PaddingRight>;
  paddingBottom?: SuiValue<CSS.Property.PaddingBottom>;
  paddingLeft?: SuiValue<CSS.Property.PaddingLeft>;

  paddingInline?: SuiValue<CSS.Property.PaddingInline>;
  paddingInlineStart?: SuiValue<CSS.Property.PaddingInlineStart>;
  paddingInlineEnd?: SuiValue<CSS.Property.PaddingInlineEnd>;

  paddingBlock?: SuiValue<CSS.Property.PaddingBlock>;
  paddingBlockStart?: SuiValue<CSS.Property.PaddingBlockStart>;
  paddingBlockEnd?: SuiValue<CSS.Property.PaddingBlockEnd>;

  //
  // Margin
  //
  margin?: SuiValue<CSS.Property.Margin>;
  marginTop?: SuiValue<CSS.Property.MarginTop>;
  marginRight?: SuiValue<CSS.Property.MarginRight>;
  marginBottom?: SuiValue<CSS.Property.MarginBottom>;
  marginLeft?: SuiValue<CSS.Property.MarginLeft>;

  marginInline?: SuiValue<CSS.Property.MarginInline>;
  marginInlineStart?: SuiValue<CSS.Property.MarginInlineStart>;
  marginInlineEnd?: SuiValue<CSS.Property.MarginInlineEnd>;

  marginBlock?: SuiValue<CSS.Property.MarginBlock>;
  marginBlockStart?: SuiValue<CSS.Property.MarginBlockStart>;
  marginBlockEnd?: SuiValue<CSS.Property.MarginBlockEnd>;

  //
  // Optional: gap (if you want spacing to own it)
  //
  gap?: SuiValue<CSS.Property.Gap>;
  rowGap?: SuiValue<CSS.Property.RowGap>;
  columnGap?: SuiValue<CSS.Property.ColumnGap>;

  //
  // Meta
  //
  usingBreakpoints?: Array<Breakpoint | InlineBreakpoint>;
  usingStates?: StateKey[];
}

/* ============================================================================
 * suiSpacing() Utility
 * ==========================================================================*/

export const suiSpacing = createSuiUtility<SuiSpacingProps>("spacing");

/* ============================================================================
 * Registration
 * ==========================================================================*/

registerUtility("spacing", suiSpacing);

/**
 * @description
 * Module augmentation so `suiSheet()` recognizes `spacing` as a valid utility.
 */
declare module "../types" {
  interface RegisteredUtilities {
    spacing: SuiSpacingProps;
  }
}
