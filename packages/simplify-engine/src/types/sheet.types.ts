/**
 * @module simplify-engine/src/types/sheet
 * @version 1.0.0
 *
 * @description
 * Type contracts for the `suiSheet()` API.
 *
 * This module defines:
 * - `SheetInput` — the input shape accepted by `suiSheet()`
 * - `SuiSheetReturn` — the augmented classname string returned by `suiSheet()`
 *
 * A sheet accepts:
 * - Any registered utility (layout, surface, shape, motion, etc.)
 * - Optional viewport breakpoints
 * - Optional container query configuration
 * - Optional container‑child mode
 *
 * These types sit at the top of the dependency graph and depend only on:
 * - Breakpoint types
 * - Container types
 * - Registered utility types
 *
 * This file contains **no runtime logic** and is safe for static analysis.
 */

import type { Breakpoint, InlineBreakpoint } from "./breakpoints.types";
import type { ContainerSizeMap } from "./container.types";
import type { RegisteredUtilities } from "./utility.types";

// ============================================================================
// Sheet Input
// ============================================================================

/**
 * @description
 * Input shape for `suiSheet()`.
 *
 * Each key in `RegisteredUtilities` maps to the config expected by that utility.
 * Additional sheet‑level options include:
 * - `usingBreakpoints` → viewport breakpoints to activate
 * - `containerSizes`   → named container size map
 * - `isContainerChild` → enables container‑child mode
 */
export type SheetInput = {
  usingBreakpoints?: Array<Breakpoint | InlineBreakpoint>;
  containerSizes?: ContainerSizeMap;
  isContainerChild?: boolean;
} & {
  [K in keyof RegisteredUtilities]?: RegisteredUtilities[K];
};

// ============================================================================
// Sheet Return Type
// ============================================================================

/**
 * @description
 * Return type of `suiSheet()`.
 *
 * The returned value is:
 * - A string of merged classnames
 * - Augmented with `.asLayer(name)` to wrap the sheet in a CSS `@layer`
 *
 * The augmentation is structural and deterministic.
 */
export type SuiSheetReturn = string & {
  asLayer: (name: string) => string;
};
