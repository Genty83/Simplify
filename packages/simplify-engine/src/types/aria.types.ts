/**
 * @module simplify-engine/types/aria
 * @version 1.0.0
 *
 * @description
 * Strongly‑typed WAI‑ARIA attributes supported by the Simplify Engine.
 *
 * These attributes map directly to DOM attributes and are passed through
 * verbatim by the engine. Only attributes that are broadly applicable across
 * interactive components are included here. Component‑specific attributes
 * (e.g., `aria-colindex`) may be added in future versions.
 *
 * This module is intentionally dependency‑free to avoid circular imports.
 * It is purely declarative and safe for static analysis.
 */

// ============================================================================
// ARIA Attributes
// ============================================================================

/**
 * @description
 * Strongly‑typed WAI‑ARIA attributes supported by the Simplify Engine.
 *
 * These attributes map 1:1 to DOM attributes and are emitted structurally
 * without inference or transformation.
 */
export type AriaAttributes = {
  // Labeling
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;

  // Visibility
  "aria-hidden"?: boolean;

  // Boolean states
  "aria-expanded"?: boolean;
  "aria-checked"?: boolean;
  "aria-selected"?: boolean;
  "aria-disabled"?: boolean;
  "aria-pressed"?: boolean;

  // Live regions
  "aria-live"?: "off" | "polite" | "assertive";
  "aria-busy"?: boolean;

  // Modal
  "aria-modal"?: boolean;

  // Relationships
  "aria-controls"?: string;

  /**
   * Indicates the current item within a set.
   *
   * - `boolean` → true/false state
   * - `"page"` → current page in pagination
   * - `"step"` → current step in a wizard
   * - `"location"` → current location in navigation
   * - `"date"` / `"time"` → current temporal selection
   */
  "aria-current"?:
    | boolean
    | "page"
    | "step"
    | "location"
    | "date"
    | "time";
};
