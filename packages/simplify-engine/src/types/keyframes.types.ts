/**
 * @module simplify-engine/types/keyframes
 * @version 1.0.0
 *
 * @description
 * Type contracts for keyframe animations within the Simplify Engine.
 *
 * This module defines:
 * - `KeyframeStep` — a single keyframe declaration block
 * - `KeyframesDefinition` — a full keyframes map
 * - `KeyframesResult` — structural wrapper returned after registration
 *
 * These types are intentionally dependency‑free to avoid circular imports.
 * They are used by the animation subsystem and the atomic compiler.
 *
 * This file contains **no runtime logic** and is safe for static analysis.
 */

// ============================================================================
// Keyframe Step
// ============================================================================

/**
 * @description
 * A single keyframe step.
 *
 * Example:
 * ```ts
 * { opacity: 0, transform: "scale(0.9)" }
 * ```
 */
export type KeyframeStep = Record<string, string | number>;

// ============================================================================
// Keyframes Definition
// ============================================================================

/**
 * @description
 * A full keyframes definition.
 *
 * Example:
 * ```ts
 * {
 *   "0%": { opacity: 0 },
 *   "100%": { opacity: 1 }
 * }
 * ```
 */
export interface KeyframesDefinition {
  [step: string]: KeyframeStep;
}

// ============================================================================
// Keyframes Result Wrapper
// ============================================================================

/**
 * @description
 * Result of registering keyframes.
 *
 * The wrapper ensures:
 * - deterministic naming
 * - structural tagging via `__keyframes`
 * - compatibility with the atomic compiler
 */
export interface KeyframesResult {
  __keyframes: true;
  name: string;
}
