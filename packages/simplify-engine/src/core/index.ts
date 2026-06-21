/**
 * @module simplify-engine/src/core
 * @version 1.0.1
 *
 * @description
 * Public entrypoint for the SimplifyUI core engine.
 *
 * The core layer provides the foundational runtime primitives that power the
 * entire Simplify system, including:
 *
 * - hashing utilities (`hashString`, `hashRuleKey`)
 * - atomic rule registry (`getRule`, `registerRule`, etc.)
 * - stylesheet manager (`injectCSS`, `wrapInLayer`, etc.)
 * - breakpoint utilities and resolvers
 * - rule → CSS compilation helpers
 * - the `sui()` class composer
 *
 * This module exposes only the **stable, public API surface** of the core.
 * Internal helpers, experimental features, and engine internals are not
 * exported here.
 *
 * Exports are **explicit by design**:
 * - No wildcard (`export *`) re‑exports
 * - No accidental API leakage
 * - No implicit surface expansion
 *
 * This ensures:
 * - Deterministic public contracts
 * - Predictable versioning
 * - Clear separation between internal and public modules
 *
 * @example
 * import { hashRuleKey, ruleToCSS, sui } from "@simplify/core";
 */

export {
  hashString,
  hashRuleKey,
  hashCanonicalRule
} from "./hashing";

export {
  hasRule,
  registerRule,
  getRule,
  getAllRules,
  deleteRule,
  clearRegistry,
  getRuleCount,
  hasCanonicalRule,
} from "./registry";

export {
  getStyleTag,
  injectCSS,
  clearStylesheet,
  resetStylesheet,
  wrapInLayer,
  flushStylesheet
} from "./stylesheet";

/**
 * Utilities (explicit exports from utils barrel)
 */
export {
  toKebab,
  normalize,
  at,
  to,
  between,
  resolveBreakpoint,
  isContainerMedia,
  ruleToCSS,
  ruleKey,
  sortRulesByState,
  setBreakpoints,
  getBreakpoints,
  resetBreakpoints
} from "./utils";

export { sui } from "./sui";

export { suiSheet } from "./suiSheet";
