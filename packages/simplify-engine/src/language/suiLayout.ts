/**
 * @module simplify-engine/src/language/suiLayout
 *
 * @description
 * The Layout utility for the SimplifyUI design system.
 *
 * This module defines the `suiLayout` utility — one of the seven core UI
 * design primitives in Simplify:
 *
 * - layout   ← this module
 * - surface
 * - shape
 * - motion
 * - sizing
 * - typography
 * - interaction
 *
 * The layout utility controls all *structural* and *flow* properties:
 * - display modes
 * - flexbox
 * - grid
 * - alignment
 * - spacing (gap)
 * - positioning
 * - inset
 * - z-index
 * - float / clear
 * - isolation
 * - columns
 *
 * All properties support:
 * - primitive values
 * - responsive objects
 * - state wrappers
 * - container wrappers
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

export interface SuiLayoutProps {
  layout?: SuiValue<CSS.Property.Display>;
  flow?: SuiValue<CSS.Property.FlexDirection>;
  space?: SuiValue<CSS.Property.Gap>;
  spaceX?: SuiValue<CSS.Property.ColumnGap>;

  /** Vertical spacing → rowGap */
  spaceY?: SuiValue<CSS.Property.RowGap>;

  /** Cross‑axis alignment → alignItems */
  align?: SuiValue<CSS.Property.AlignItems>;

  /** Main‑axis justification → justifyContent */
  justify?: SuiValue<CSS.Property.JustifyContent>;

  /** Placement → placeItems */
  place?: SuiValue<CSS.Property.PlaceItems>;

  /** Semantic grid columns → gridTemplateColumns */
  columns?: SuiValue<CSS.Property.GridTemplateColumns>;

  /* -------------------------------------------------------------------------
   * RAW CSS PROPS (Full Power, Backward Compatible)
   * ---------------------------------------------------------------------- */

  // Display
  display?: SuiValue<CSS.Property.Display>;

  // Flexbox
  flexDirection?: SuiValue<CSS.Property.FlexDirection>;
  flexWrap?: SuiValue<CSS.Property.FlexWrap>;
  flexGrow?: SuiValue<CSS.Property.FlexGrow>;
  flexShrink?: SuiValue<CSS.Property.FlexShrink>;
  flexBasis?: SuiValue<CSS.Property.FlexBasis>;
  flex?: SuiValue<CSS.Property.Flex>;

  justifyContent?: SuiValue<CSS.Property.JustifyContent>;
  alignItems?: SuiValue<CSS.Property.AlignItems>;
  alignContent?: SuiValue<CSS.Property.AlignContent>;
  alignSelf?: SuiValue<CSS.Property.AlignSelf>;

  // Grid
  gridTemplateColumns?: SuiValue<CSS.Property.GridTemplateColumns>;
  gridTemplateRows?: SuiValue<CSS.Property.GridTemplateRows>;
  gridAutoFlow?: SuiValue<CSS.Property.GridAutoFlow>;
  gridAutoColumns?: SuiValue<CSS.Property.GridAutoColumns>;
  gridAutoRows?: SuiValue<CSS.Property.GridAutoRows>;
  gridColumn?: SuiValue<CSS.Property.GridColumn>;
  gridRow?: SuiValue<CSS.Property.GridRow>;

  // Gap
  gap?: SuiValue<CSS.Property.Gap>;
  rowGap?: SuiValue<CSS.Property.RowGap>;
  columnGap?: SuiValue<CSS.Property.ColumnGap>;

  // Positioning
  position?: SuiValue<CSS.Property.Position>;
  top?: SuiValue<CSS.Property.Top>;
  right?: SuiValue<CSS.Property.Right>;
  bottom?: SuiValue<CSS.Property.Bottom>;
  left?: SuiValue<CSS.Property.Left>;
  inset?: SuiValue<CSS.Property.Inset>;
  zIndex?: SuiValue<CSS.Property.ZIndex>;

  // Float / Clear
  float?: SuiValue<CSS.Property.Float>;
  clear?: SuiValue<CSS.Property.Clear>;

  // Columns (raw)
  columnsRaw?: SuiValue<CSS.Property.Columns>;

  // Isolation
  isolation?: SuiValue<CSS.Property.Isolation>;

  /* -------------------------------------------------------------------------
   * CONTAINER QUERIES (NEW)
   * ---------------------------------------------------------------------- */

  /** Declares this element as a container → container-type */
  containerType?: SuiValue<CSS.Property.ContainerType>;

  /** Optional container name → container-name */
  containerName?: SuiValue<CSS.Property.ContainerName>;

  /* -------------------------------------------------------------------------
   * META
   * ---------------------------------------------------------------------- */

  usingBreakpoints?: Array<Breakpoint | InlineBreakpoint>;
  usingStates?: StateKey[];
  usingContainers?: AnyContainerBreakpoint[];
}


/* ============================================================================
 * Semantic → CSS Mapping
 * ==========================================================================*/

const layoutMap: Record<string, string> = {
  layout: "display",
  flow: "flexDirection",

  // spacing
  space: "gap",
  spaceX: "columnGap",
  spaceY: "rowGap",

  // alignment
  align: "alignItems",
  justify: "justifyContent",
  place: "placeItems",

  // grid
  columns: "gridTemplateColumns",
};

/* ============================================================================
 * suiLayout() Utility
 * ==========================================================================*/

export const suiLayout = createSuiUtility<SuiLayoutProps>("layout", layoutMap);

/* ============================================================================
 * Registration
 * ==========================================================================*/

registerUtility("layout", suiLayout);

/**
 * @description
 * Module augmentation so `suiSheet()` recognizes `layout` as a valid utility.
 */
declare module "../types/index" {
  interface RegisteredUtilities {
    layout: SuiLayoutProps;
  }
}
