/**
 * @module simplify-engine/src/language
 *
 * @description
 * Public entrypoint for the SimplifyUI language layer.
 *
 * This folder contains the seven core UI design utilities that form the
 * Simplify design language:
 *
 * - layout
 * - surface
 * - shape
 * - motion
 * - sizing
 * - typography
 * - interaction
 *
 * Each utility:
 * - exposes a typed props interface
 * - is wrapped by `createSuiUtility()`
 * - is registered via `registerUtility()`
 * - plugs into `suiSheet()` for component‑level composition
 *
 * Consumers can import utilities directly from:
 *
 *   import { suiLayout, suiSurface } from "@simplify/language";
 *
 * @version 1.0.0
 * @since 0.2.0
 */

export { suiSizing, type SuiSizingProps } from "./suiSizing";
export { suiSurface, type SuiSurfaceProps } from "./suiSurface";
export { suiLayout, type SuiLayoutProps } from "./suiLayout";
export { suiShape, type SuiShapeProps } from "./suiShape";
export { suiMotion, type SuiMotionProps } from "./suiMotion";
export { suiTypography, type SuiTypographyProps } from "./suiTypography";
export { suiInteraction, type SuiInteractionProps } from "./suiInteraction";
export { suiSpacing, type SuiSpacingProps } from "./suiSpacing";
