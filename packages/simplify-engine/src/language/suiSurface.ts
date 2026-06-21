/**
 * @module simplify-engine/src/language/suiSurface
 *
 * @description
 * The Surface utility for the SimplifyUI design system.
 *
 * This module defines the `suiSurface` utility — one of the seven core UI
 * design primitives in Simplify:
 *
 * - layout
 * - surface   ← this module
 * - shape
 * - motion
 * - sizing
 * - typography
 * - interaction
 *
 * The surface utility controls all *visual surface properties*:
 *
 * - background layers
 * - foreground color
 * - borders
 * - outlines
 * - shadows
 * - opacity
 * - blend modes
 *
 * All properties support:
 * - primitive values (string | number)
 * - responsive objects
 * - state wrappers (hover, pressed, disabled, etc.)
 * - container wrappers (via `suiSheet`)
 * - paint tokens (via `resolvePaint`)
 *
 * @example
 * const cls = suiSurface({
 *   backgroundColor: "blue.500",
 *   color: "white",
 *   borderColor: { hover: "blue.600" },
 *   opacity: { disabled: 0.4 }
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
 * Surface Props
 * ==========================================================================*/

/**
 * @description
 * Full set of surface‑related properties supported by the Simplify surface
 * utility. This interface is intentionally comprehensive and future‑proof,
 * covering the entire CSS visual surface specification.
 *
 * All properties accept `SuiValue<T>`, enabling:
 * - responsive values
 * - stateful values
 * - container‑aware values
 * - normalization
 * - paint token resolution
 */
export interface SuiSurfaceProps {
  //
  // Backgrounds
  //
  background?: SuiValue<CSS.Property.Background>;
  backgroundColor?: SuiValue<CSS.Property.BackgroundColor>;
  backgroundImage?: SuiValue<CSS.Property.BackgroundImage>;
  backgroundSize?: SuiValue<CSS.Property.BackgroundSize>;
  backgroundPosition?: SuiValue<CSS.Property.BackgroundPosition>;
  backgroundRepeat?: SuiValue<CSS.Property.BackgroundRepeat>;
  backgroundAttachment?: SuiValue<CSS.Property.BackgroundAttachment>;
  backgroundBlendMode?: SuiValue<CSS.Property.BackgroundBlendMode>;

  //
  // Foreground color
  //
  color?: SuiValue<CSS.Property.Color>;

  //
  // Borders
  //
  border?: SuiValue<CSS.Property.Border>;
  borderWidth?: SuiValue<CSS.Property.BorderWidth>;
  borderStyle?: SuiValue<CSS.Property.BorderStyle>;
  borderColor?: SuiValue<CSS.Property.BorderColor>;

  borderTop?: SuiValue<CSS.Property.BorderTop>;
  borderRight?: SuiValue<CSS.Property.BorderRight>;
  borderBottom?: SuiValue<CSS.Property.BorderBottom>;
  borderLeft?: SuiValue<CSS.Property.BorderLeft>;

  borderTopColor?: SuiValue<CSS.Property.BorderTopColor>;
  borderRightColor?: SuiValue<CSS.Property.BorderRightColor>;
  borderBottomColor?: SuiValue<CSS.Property.BorderBottomColor>;
  borderLeftColor?: SuiValue<CSS.Property.BorderLeftColor>;

  //
  // Outlines
  //
  outline?: SuiValue<CSS.Property.Outline>;
  outlineColor?: SuiValue<CSS.Property.OutlineColor>;
  outlineWidth?: SuiValue<CSS.Property.OutlineWidth>;
  outlineStyle?: SuiValue<CSS.Property.OutlineStyle>;
  outlineOffset?: SuiValue<CSS.Property.OutlineOffset>;

  //
  // Shadows
  //
  boxShadow?: SuiValue<CSS.Property.BoxShadow>;
  textShadow?: SuiValue<CSS.Property.TextShadow>;

  //
  // Opacity
  //
  opacity?: SuiValue<CSS.Property.Opacity>;

  //
  // Blend modes
  //
  mixBlendMode?: SuiValue<CSS.Property.MixBlendMode>;

  //
  // Meta
  //
  usingBreakpoints?: Array<Breakpoint | InlineBreakpoint>;
  usingStates?: StateKey[];

/** Container query breakpoints for this utility */
  usingContainers?: AnyContainerBreakpoint[];
}

/* ============================================================================
 * suiSurface() Utility
 * ==========================================================================*/

/**
 * @description
 * High‑level SUI surface utility.
 *
 * This wraps the low‑level `createUtility("surface")` compiler with:
 * - automatic responsive expansion (`autoRs`)
 * - meta‑field extraction
 * - container query support
 * - state expansion
 *
 * @example
 * const cls = suiSurface({
 *   backgroundColor: "blue.500",
 *   borderColor: { hover: "blue.600" },
 *   opacity: { disabled: 0.4 }
 * }).atomize();
 */
export const suiSurface = createSuiUtility<SuiSurfaceProps>("surface");

/* ============================================================================
 * Registration
 * ==========================================================================*/

registerUtility("surface", suiSurface);

/**
 * @description
 * Module augmentation so `suiSheet()` recognizes `surface` as a valid utility.
 */
declare module "../types" {
  interface RegisteredUtilities {
    surface: SuiSurfaceProps;
  }
}
