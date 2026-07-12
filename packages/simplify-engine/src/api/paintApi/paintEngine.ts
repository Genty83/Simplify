/**
 * @module simplify-engine/src/color/paintEngine
 * @version 1.0.0
 *
 * @description
 * Core runtime utilities for resolving `ModeColor` tokens into concrete,
 * mode‑specific CSS color strings. This module acts as the execution layer of
 * the SimplifyUI color pipeline, bridging authored theme tokens with the
 * active UI mode at runtime.
 *
 * Responsibilities:
 * - Maintain the globally active `ThemeMode`
 * - Resolve `ModeColor` tokens using explicit overrides or global mode
 * - Provide a deterministic fallback chain to guarantee a valid color output
 *
 * This engine is intentionally minimal and framework‑agnostic. Higher‑level
 * systems (React providers, Svelte stores, Solid signals, etc.) should wrap
 * `setThemeMode()` and `getThemeMode()` to integrate with UI reactivity.
 *
 * All behavior is:
 * - **Deterministic** — no inference, no mutation of tokens
 * - **Rectangular** — every resolution path yields a valid CSS color
 * - **Predictable** — fallback chain is explicit and stable
 *
 * @example
 * setThemeMode("dark");
 * const color = resolvePaint(myToken); // resolves using dark mode
 *
 * @example
 * const forced = resolvePaint(myToken, { mode: "highContrast" });
 *
 * @see ModeColor
 * @see ThemeMode
 * @see PaintOptions
 */

import type { ModeColor, ThemeMode, PaintOptions } from "./types";



/**
 * @description
 * Internal global state representing the currently active theme mode.
 *
 * Defaults to `"light"` to ensure deterministic startup behavior.
 */
let currentMode: ThemeMode = "light";



/**
 * @function setThemeMode
 * @description
 * Sets the globally active `ThemeMode` used by `resolvePaint()` when no
 * explicit override is provided.
 *
 * This function does not trigger reactivity or emit events. It is a pure
 * state setter. Framework‑specific integrations should wrap this function.
 *
 * @example
 * setThemeMode("dark");
 *
 * @param mode - The theme mode to activate globally.
 */
export function setThemeMode(mode: ThemeMode): void {
  currentMode = mode;
}



/**
 * @function getThemeMode
 * @description
 * Returns the currently active global theme mode.
 *
 * @example
 * const mode = getThemeMode();
 *
 * @returns The active ThemeMode.
 */
export function getThemeMode(): ThemeMode {
  return currentMode;
}



/**
 * @function resolvePaint
 * @description
 * Resolves a `ModeColor` token into a concrete CSS color string.
 *
 * Resolution order:
 * 1. Explicit override via `PaintOptions.mode`
 * 2. Globally active theme mode (`currentMode`)
 * 3. Deterministic fallback chain:
 *    - `token[mode]`
 *    - `token.light`
 *    - `token.dark`
 *    - `token.highContrast`
 *    - `"#000000"` (final hard fallback)
 *
 * This ensures that **every** call returns a valid CSS color, even if a theme
 * author accidentally omits a mode.
 *
 * @example
 * const color = resolvePaint(myToken);
 *
 * @example
 * const forced = resolvePaint(myToken, { mode: "highContrast" });
 *
 * @param token - The ModeColor token to resolve.
 * @param options - Optional PaintOptions that may force a specific mode.
 *
 * @returns A concrete CSS color string.
 */
export function resolvePaint(
  token: ModeColor,
  options?: PaintOptions
): string {
  const mode = options?.mode ?? currentMode;

  return (
    token[mode] ??
    token.light ??
    token.dark ??
    token.highContrast ??
    "#000000"
  );
}
