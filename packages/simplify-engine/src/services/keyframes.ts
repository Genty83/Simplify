/**
 * @module simplify-engine/src/services/keyframes
 * @version 1.0.0
 *
 * @description
 * Keyframe generation utilities for the SimplifyUI engine.
 *
 * This service module provides:
 *
 * - conversion of keyframe steps into CSS (`stepToCSS`)
 * - deterministic keyframe hashing (`keyframes`)
 * - automatic rule registration and stylesheet injection
 *
 * Keyframes in SimplifyUI are:
 * - structural (no prototype reliance)
 * - deterministic (hash‑based naming)
 * - deduplicated (same definition → same animation name)
 * - injected once per unique definition
 */

import { hashRuleKey, hasRule, registerRule } from "../core";
import { injectCSS } from "../core";
import { toKebab } from "../core";
import type {
  KeyframeStep,
  KeyframesDefinition,
  KeyframesResult,
} from "../types";

// ============================================================================
// STEP → CSS
// ============================================================================

/**
 * Converts a single keyframe step object into a CSS declaration block.
 *
 * @example
 * stepToCSS({ opacity: 0, transform: "scale(0.9)" })
 * // → "opacity: 0 transform: scale(0.9)"
 */
export function stepToCSS(step: KeyframeStep): string {
  return Object.entries(step)
    .map(([prop, value]) => `${toKebab(prop)}: ${value}`)
    .join(" ");
}

// ============================================================================
// KEYFRAME GENERATION
// ============================================================================

/******************************************************************************
 * @function keyframes
 * @description
 * Creates a deterministic, deduplicated `@keyframes` animation from a
 * definition object. The definition is JSON‑stringified and hashed to produce
 * a stable animation name. If the animation has not been registered before,
 * the engine generates a full `@keyframes` block, registers it, and injects it
 * into the stylesheet. Identical definitions always resolve to the same name,
 * ensuring atomic consistency and preventing duplicate CSS.
 *
 * Deterministic Rules:
 * - Same definition → same animation name
 * - Different definition → different animation name
 * - No randomness; hashing ensures stable output across builds
 *
 * Deduplication Rules:
 * - Keyframes are injected only once per unique definition
 * - Subsequent calls return the existing animation name
 *
 * Usage:
 * - Use inside motion utilities or animation helpers
 * - The returned `name` can be assigned directly to `animationName`
 *
 * @example
 * // Define a fade‑in animation
 * const fadeIn = keyframes({
 *   "0%":   { opacity: 0 },
 *   "100%": { opacity: 1 }
 * });
 *
 * // Use inside a motion utility
 * motion({
 *   animationName: fadeIn.name,
 *   animationDuration: "300ms",
 *   animationTimingFunction: "ease"
 * });
 *
 * // CSS emitted once:
 * // @keyframes kf‑abc123 {
 * //   0%   { opacity: 0 }
 * //   100% { opacity: 1 }
 * // }
 *
 * @params definition KeyframesDefinition
 * A map of keyframe steps (e.g. "0%", "50%", "100%") to style objects.
 *
 * @returns KeyframesResult
 * An object containing the deterministic animation name.
 ******************************************************************************/

export function keyframes(definition: KeyframesDefinition): KeyframesResult {
  const json = JSON.stringify(definition);
  const name = `kf-${hashRuleKey(json)}`;

  if (!hasRule(name)) {
    const steps = Object.entries(definition)
      .map(([step, styles]) => `${step}: ${stepToCSS(styles)}`)
      .join(" ");

    const css = `@keyframes ${name} { ${steps} }`;

    registerRule(name, css);
    injectCSS(css);
  }

  return {
    __keyframes: true,
    name,
  };
}
