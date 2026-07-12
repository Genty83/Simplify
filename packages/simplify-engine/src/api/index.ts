/******************************************************************************
 * @module simplify-engine/src/api
 * @version 1.0.0
 * @author
 *   SimplifyUI Engineering — Craig Gent
 *
 * @description
 * Public entry point for SimplifyUI subsystem APIs.
 *
 * Responsibilities:
 * - Re-export stable, domain-scoped API packages
 * - Provide a unified import surface for engine-level utilities
 * - Preserve strict subsystem boundaries (tokens, paint, aria)
 * - Ensure deterministic, side-effect-free module loading
 *
 * Included Subsystems:
 * - ariaApi      — ARIA selector mapping + accessibility state resolution
 * - paintApi     — Structural → CSS property/value expansion
 * - tokensApi    — Token resolution for color, space, typography, motion
 *
 * Non-Responsibilities:
 * - Sheet orchestration (handled by core/sheet)
 * - Atomic rule compilation (handled by core/atomic)
 * - DOM insertion or stylesheet management (handled by core/runtime)
 * - Language utilities (layout, surface, spacing, sizing, etc.)
 *
 * Design Principles:
 * - Pure re-export layer (no runtime logic)
 * - Rectangular, predictable module boundaries
 * - Subsystems remain closed-box and independently testable
 * - Safe for SSR, workers, and edge runtimes
 *****************************************************************************/

export * from "./ariaApi";
export * from "./paintApi";
export * from "./tokensApi";
