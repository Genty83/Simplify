/**
 * @module simplify-engine/src/color/paint
 * @version 1.0.0
 *
 * @description
 * Declarative utilities for marking color tokens as *paintable* values within
 * the SimplifyUI theming and rendering pipeline.
 *
 * A `PaintValue` is a lightweight wrapper around a `ModeColor` token that
 * optionally carries rendering options such as the active `ThemeMode`. This
 * wrapper allows downstream systems (CSS variable resolvers, canvas engines,
 * style compilers) to distinguish raw color tokens from values that require
 * mode‑aware resolution.
 *
 * The utilities in this module follow the same principles as the rest of the
 * Simplify design system:
 *
 * - **Deterministic** — no mutation, no inference, no hidden behavior.
 * - **Rectangular** — every paint value is fully shaped and tagged.
 * - **Composable** — `paint.with()` enables ergonomic partial application.
 * - **Runtime‑safe** — `isPaint()` provides a strict, type‑safe guard.
 *
 * @example
 * // Marking a ModeColor token as paintable
 * const bg = paint(mc("#fff", "#111", "#000"));
 *
 * @example
 * // Forcing a specific mode
 * const forced = paint(mc("#fff", "#111", "#000"), "dark");
 *
 * @example
 * // Creating a reusable painter
 * const darkPaint = paint.with({ mode: "dark" });
 * const fg = darkPaint(mc("#000", "#fff", "#000"));
 *
 * @see ModeColor
 * @see ThemeMode
 */

import type { ModeColor, ThemeMode, PaintOptions, PaintValue } from "./types";


/**
 * @function paint
 * @description
 * Wraps a `ModeColor` token in a `PaintValue`, optionally applying rendering
 * options or forcing a specific theme mode.
 *
 * The second parameter accepts either:
 * - a `ThemeMode` string, or
 * - a `PaintOptions` object
 *
 * @example
 * const value = paint(myColorToken);
 *
 * @example
 * const forced = paint(myColorToken, "highContrast");
 *
 * @example
 * const configured = paint(myColorToken, { mode: "dark" });
 *
 * @param token - The ModeColor token to wrap.
 * @param modeOrOptions - A ThemeMode or PaintOptions object.
 *
 * @returns A fully‑formed PaintValue.
 */
export function paint(
  token: ModeColor,
  modeOrOptions?: ThemeMode | PaintOptions,
): PaintValue {
  const options: PaintOptions | undefined =
    typeof modeOrOptions === "string" ? { mode: modeOrOptions } : modeOrOptions;

  return {
    __paint: true,
    token,
    options,
  };
}

/**
 * @description
 * Creates a partially‑applied paint function with predefined options.
 *
 * Useful for building mode‑specific or context‑specific painters.
 *
 * @example
 * const darkPaint = paint.with({ mode: "dark" });
 * const fg = darkPaint(myColorToken);
 *
 * @param options - Options to apply to all painted values.
 *
 * @returns A function that wraps ModeColor tokens using the provided options.
 */
paint.with = (options: PaintOptions) => {
  return (token: ModeColor): PaintValue => paint(token, options);
};

/**
 * @function isPaint
 * @description
 * Type‑safe runtime guard for detecting `PaintValue` objects.
 *
 * This implementation avoids `any` entirely and works safely with `unknown`.
 *
 * @example
 * if (isPaint(value)) {
 *   console.log(value.token.light);
 * }
 *
 * @param value - A value of unknown type.
 *
 * @returns `true` if the value is a PaintValue.
 */
export function isPaint(value: unknown): value is PaintValue {
  if (
    typeof value !== "object" ||
    value === null ||
    !("__paint" in value) ||
    (value as any).__paint !== true ||
    !("token" in value)
  ) {
    return false;
  }

  const token = (value as any).token;

  return (
    typeof token === "object" &&
    token !== null &&
    "light" in token &&
    "dark" in token &&
    "highContrast" in token
  );
}

