/**
 * @module simplify-engine/src/tokens/tokensEngine
 * @version 1.0.0
 *
 * @description
 * Mutable token engine for the Simplify styling system.
 *
 * This module manages the active token set used across:
 * - utilities
 * - responsive engine
 * - sheets engine
 * - paint + color layers
 * - upcoming SimplifyUI theme provider
 *
 * Tokens are intentionally mutable. Calling `setTokens()` deep‑merges
 * overrides into the live token object, enabling runtime theming and
 * user‑defined customization.
 */

import { tokens as defaultTokens } from "./tokens";
import type { SuiTokens } from "./types";

/* ============================================================================
 * Internal State
 * ==========================================================================*/

/**
 * @internal
 * The live, mutable token set used by the engine.
 */
let activeTokens: SuiTokens = structuredClone(defaultTokens);

/* ============================================================================
 * Helpers
 * ==========================================================================*/

/**
 * @function isObject
 * @description
 * Returns `true` if the value is a non‑array object.
 */
function isObject<T>(value: T): value is T & object {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @function mergeValue
 * @description
 * Merges two values. If both are objects, performs a deep merge.
 * Otherwise, the new value overwrites the old one.
 */
function mergeValue<T>(current: T, next: T): T {
  return isObject(current) && isObject(next)
    ? deepMerge(current, next)
    : next;
}

/**
 * @function deepMerge
 * @description
 * Deep‑merges two objects of the same shape.
 *
 * Characteristics:
 * - fully typed
 * - no index signatures
 * - no nested branching
 * - deterministic and pure
 *
 * @example
 * const merged = deepMerge(a, b);
 *
 * @returns A new object containing merged values.
 */
function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key of Object.keys(source) as Array<keyof T>) {
    const next = source[key];
    if (next === undefined) continue;

    const current = result[key];
    result[key] = mergeValue(current, next);
  }

  return result;
}

/* ============================================================================
 * Public API
 * ==========================================================================*/

/**
 * @function getTokens
 * @description
 * Returns the current active token set.
 *
 * Useful for:
 * - utilities that need token values
 * - theme providers
 * - debugging and inspection
 *
 * @example
 * const t = getTokens();
 * console.log(t.typography.fontSize.medium);
 *
 * @returns The live `SuiTokens` object.
 */
export function getTokens(): SuiTokens {
  return activeTokens;
}

/**
 * @function setTokens
 * @description
 * Deep‑merges a partial token object into the active token set.
 *
 * Useful for:
 * - runtime theming
 * - user overrides
 * - loading Google Fonts and updating typography tokens
 *
 * @example
 * setTokens({
 *   typography: {
 *     fontFamily: { sans: "Inter, system-ui, sans-serif" }
 *   }
 * });
 *
 * @returns void
 */
export function setTokens(partial: Partial<SuiTokens>): void {
  activeTokens = deepMerge(activeTokens, partial);
}

/**
 * @function resetTokens
 * @description
 * Restores the token set back to the default values.
 *
 * Useful for:
 * - theme resets
 * - testing
 * - SSR hydration
 *
 * @example
 * resetTokens();
 *
 * @returns void
 */
export function resetTokens(): void {
  activeTokens = structuredClone(defaultTokens);
}
