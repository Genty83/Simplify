/******************************************************************************
 *  Utility Exports
 *
 * Public entrypoint for the SimplifyUI utility layer.
 *
 * Responsibilities:
 * - expose stable, explicit utility functions
 * - provide a predictable import surface for internal modules
 *
 * This module does NOT:
 * - contain logic
 * - mutate state
 * - perform computation
 *
 * Design notes:
 * - explicit exports for clarity and tree‑shaking
 * - no wildcard exports to avoid accidental API leakage
 ***************************************************************************** */

export { toKebab, normalize } from "./strings";

/**
 * Breakpoint + Responsive Utilities
 */
export {
  at,
  to,
  between,
  resolveBreakpoint,
  isContainerMedia,
  getBreakpoints,
  setBreakpoints,
  resetBreakpoints,
  defineBreakpoint
} from "./breakpoints";

export {
  isBreakpointKey,
  parseInlineBreakpoint,
  resolveBreakpointToPx,
} from "./responsiveHelpers";

/**
 * Container Condition Utilities
 * (safe, public-facing condition builders)
 */
export {
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  orientation,
  joinConditions,
} from "./containerConditions";

/**
 * CSS Compilation Utilities
 */
export { ruleToCSS } from "./cssCompiler";

/**
 * Rule Sorting + Keys
 */
export { ruleKey, sortRulesByState } from "./ruleSorting";
