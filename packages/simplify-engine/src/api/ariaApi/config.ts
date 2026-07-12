/**
 * @module simplify-engine/ariaApi/config
 * @version 1.0.0
 * @author Craig
 *
 * @description
 * Canonical ARIA configuration for the Simplify Engine.
 *
 * This module defines the single source of truth for:
 * - supported ARIA attributes
 * - supported ARIA boolean state keys
 * - internal → DOM attribute mapping
 *
 * It is intentionally dependency‑free to avoid circular imports and is safe
 * for static analysis, code generation, and structural compilation.
 *
 * @responsibilities
 * - Provide deterministic ARIA attribute lists
 * - Provide deterministic ARIA state key lists
 * - Provide the internal → DOM ARIA mapping used by ariaState() and compilers
 * - Remain stable across engine versions to ensure selector consistency
 *
 * @non-responsibilities
 * - Does not perform runtime validation
 * - Does not infer or transform ARIA values
 * - Does not depend on DOM, JSX, or component implementations
 *
 * @design-principles
 * - Purely declarative
 * - Zero runtime branching
 * - No external dependencies
 * - Structural, predictable, and safe for static analysis
 */

// ============================================================================
// SUPPORTED ARIA ATTRIBUTES
// ============================================================================

/**
 * @description
 * Full list of ARIA attributes supported by the engine.
 *
 * Used by:
 * - structural attribute emission
 * - validation layers
 * - rule compilers
 */
export const ariaAttributes = [
  // Labeling
  "aria-label",
  "aria-labelledby",
  "aria-describedby",

  // Visibility
  "aria-hidden",

  // Boolean states
  "aria-expanded",
  "aria-selected",
  "aria-checked",
  "aria-pressed",
  "aria-disabled",

  // Live regions
  "aria-live",
  "aria-busy",

  // Modal
  "aria-modal",

  // Relationships
  "aria-controls",

  // Current item
  "aria-current"
] as const;

// ============================================================================
// SUPPORTED ARIA BOOLEAN STATE KEYS
// ============================================================================

/**
 * @description
 * Internal ARIA state keys used by the engine.
 *
 * These map directly to DOM attributes via `ariaStateMap`.
 */
export const ariaStateKeys = [
  "ariaExpanded",
  "ariaSelected",
  "ariaChecked",
  "ariaPressed",
  "ariaDisabled",
  "ariaCurrent",
  "ariaBusy"
] as const;

// ============================================================================
// ARIA STATE MAP (Single Source of Truth)
// ============================================================================

/**
 * @description
 * Maps internal ARIA state keys to their corresponding ARIA attribute names.
 *
 * Used by:
 * - `ariaState()` helper
 * - state selector generation
 * - rule compilers
 */
export const ariaStateMap = {
  ariaExpanded: "aria-expanded",
  ariaSelected: "aria-selected",
  ariaChecked: "aria-checked",
  ariaPressed: "aria-pressed",
  ariaDisabled: "aria-disabled",
  ariaCurrent: "aria-current",
  ariaBusy: "aria-busy"
} as const;
