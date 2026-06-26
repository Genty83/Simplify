/**
 * @module simplify-engine/src/utilities
 *
 * @description
 * Public entrypoint for the SimplifyUI utility system.
 *
 * Exposes:
 * - createUtility() — low‑level compiler
 * - createSuiUtility() — ergonomic wrapper for sui.* helpers
 * - registerUtility() — internal registry for named utilities
 */

export { createUtility } from "./createUtility";
export { createSuiUtility } from "./createSuiUtility";

export { registerUtility, getRegisteredUtilities } from "./utilityRegistry";
