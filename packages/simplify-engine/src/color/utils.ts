/**
 * @module simplify-engine/color/utils
 * @version 1.0.0
 *
 * @description
 * Utility functions for constructing deterministic, mode‑aware color objects
 * used throughout the Simplify Engine.
 *
 * This module provides low‑level helpers that make authoring theme tokens
 * predictable, explicit, and ergonomically consistent. All utilities in this
 * module follow the same principles as the rest of the Simplify design system:
 *
 * - **Rectangular** — every color must define values for all supported modes.
 * - **Deterministic** — no implicit fallbacks, no inference, no mutation.
 * - **Composable** — utilities can be safely combined to build higher‑level
 *   theme structures (surface channels, layers, semantic roles).
 * - **Runtime‑safe** — output shapes are serializable and stable.
 *
 * These helpers are intentionally minimal. They do not validate color formats,
 * transform values, or apply heuristics. Their sole purpose is to guarantee
 * that theme authors produce complete, mode‑correct color definitions.
 *
 * @example
 * // Creating a ModeColor token
 * const brandPrimary = mc(
 *   "hsl(210, 90%, 55%)",  // light
 *   "hsl(210, 90%, 50%)",  // dark
 *   "#0000ff"              // highContrast
 * );
 *
 * @example
 * // Using mc() inside a SurfaceChannel definition
 * const background = {
 *   default: mc("#ffffff", "#1a1a1a", "#000000"),
 *   hover:   mc("#f7f7f7", "#222222", "#000000"),
 *   pressed: mc("#eeeeee", "#2a2a2a", "#000000"),
 *   selected:mc("#e5e5e5", "#333333", "#000000"),
 *   disabled:mc("#f0f0f0", "#111111", "#000000")
 * };
 *
 * @see ModeColor
 * @see SimplifyTheme
 * @see simplify-engine/color/types
 */

import type { ModeColor } from "./types";

/**
 * @function mc
 * @description
 * Creates a fully‑specified `ModeColor` object from three concrete CSS color
 * values. This is the canonical helper for authoring mode‑aware color tokens
 * in the Simplify Engine.
 *
 * The function enforces a **rectangular, deterministic** structure by requiring
 * explicit values for all supported modes:
 *
 * - `light` — Light theme color
 * - `dark` — Dark theme color
 * - `highContrast` — High‑contrast accessibility mode color
 *
 * This helper is intentionally minimal: it performs no validation, mutation,
 * or transformation. It simply guarantees that all mode values are present and
 * correctly shaped.
 *
 * @example
 * const brandBg = mc(
 *   "hsl(210, 90%, 55%)",  // light
 *   "hsl(210, 90%, 50%)",  // dark
 *   "#0000ff"              // highContrast
 * );
 *
 * @param light - CSS color value for light mode.
 * @param dark - CSS color value for dark mode.
 * @param highContrast - CSS color value for high‑contrast mode.
 *
 * @returns A fully‑formed `ModeColor` object.
 */
export function mc(
  light: string,
  dark: string,
  highContrast: string,
): ModeColor {
  return {
    light,
    dark,
    highContrast,
  };
}
