/**
 * @module simplify-engine/src/color
 * @version 1.0.0
 *
 * @description
 * Public entrypoint for the SimplifyUI color subsystem.
 *
 * This module consolidates and re‑exports all color‑related primitives,
 * utilities, and runtime engines into a single, stable API surface.
 *
 * The exports here are **explicit by design**:
 * - No wildcard (`export *`) re‑exports
 * - No implicit surface expansion
 * - No accidental API leakage
 *
 * This ensures:
 * - Deterministic public contracts
 * - Predictable versioning
 * - Clear separation between internal and public modules
 *
 * Submodules included:
 * - `types` — Foundational color contracts (ModeColor, SurfaceLayer, etc.)
 * - `utils` — Low‑level helpers for constructing ModeColor tokens
 * - `paint` — Declarative paint wrappers for mode‑aware color resolution
 * - `paintEngine` — Runtime mode management + color resolution pipeline
 *
 * @example
 * import { mc, paint, resolvePaint } from "@simplify/color";
 *
 * const token = mc("#fff", "#111", "#000");
 * const value = paint(token);
 * const cssColor = resolvePaint(value.token);
 */

export {
  type ThemeMode,
  type ModeColor,
  type ColorState,
  type StateColorMap,
  type SurfaceChannel,
  type SurfaceLayer,
  type SimplifyTheme,
  type UserTheme,
  type PaintOptions,
  type PaintValue
} from "./types";

export { mc } from "./utils";

export {
  paint,
  isPaint
} from "./paint";

export {
  setThemeMode,
  getThemeMode,
  resolvePaint
} from "./paintEngine";

export { suiColor } from "./colorPalette";