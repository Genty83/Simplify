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

/**
 * Creates a deterministic keyframe animation from a definition object.
 *
 * - The definition is JSON‑stringified and hashed.
 * - The hash becomes the animation name.
 * - If the animation has not been registered before, it is injected.
 * - Subsequent calls with the same definition return the same name.
 *
 * @example
 * keyframes({
 *   "0%": { opacity: 0 },
 *   "100%": { opacity: 1 }
 * })
 * // → { __keyframes: true, name: "kf‑abc123" }
 */
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
