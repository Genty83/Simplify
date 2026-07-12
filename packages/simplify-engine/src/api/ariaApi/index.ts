/**
 * @module simplify-engine/ariaApi
 * @version 1.0.0
 *
 * @description
 * Public API surface for the ARIA subsystem.
 *
 * This module exposes strongly‑typed WAI‑ARIA roles, attributes, configuration,
 * and structural emission helpers. All exports are explicit to ensure stable
 * resolution inside the Simplify Engine and across workspace packages.
 *
 * Notes:
 * - No wildcard exports
 * - Deterministic ordering
 * - Purely structural API surface
 */

// Types
export type { Role, AriaAttributes } from "./types";

// Config
export { ariaAttributes, ariaStateKeys, ariaStateMap } from "./config";

// Engine helpers
export { suiAria, ariaLabel, ariaHidden, ariaState } from "./suiAria";
