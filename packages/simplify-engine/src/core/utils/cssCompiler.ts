/******************************************************************************
 * @module simplify-engine/src/core/compiler/cssCompiler
 * @version 1.0.0
 * @author
 *   SimplifyUI Engineering — Craig Gent
 *
 * @description
 * Converts normalized atomic rules into final CSS rule strings.
 *
 * Responsibilities:
 * - build final selectors (base + optional state)
 * - convert property names to kebab-case
 * - emit declaration blocks
 * - wrap rules in container or media queries
 *
 * Non‑Responsibilities:
 * - generating atomic rules
 * - managing the registry
 * - interacting with the DOM
 *
 * Design Principles:
 * - pure and deterministic
 * - rectangular branching (no inference)
 * - pipeline‑based selector and wrapper resolution
 * - safe for SSR, workers, and edge runtimes
 ***************************************************************************** */

import type { AtomicRule } from "../../types";
import { toKebab } from "./strings";
import { resolveBreakpoint, isContainerMedia } from "./breakpoints";
import { stateToSelector } from "../../config";

/* ============================================================================
 * Constants
 * ==========================================================================*/

const CLASS_PREFIX = ".";
const WHITESPACE_REGEX = /\s/;

/* ============================================================================
 * Error helpers
 * ==========================================================================*/

/**
 * @function throwInvalidClassName
 * @description Throws when a class name is structurally invalid.
 */
function throwInvalidClassName(name: unknown): never {
  throw new Error(`Invalid class name: ${String(name)}`);
}

/**
 * @function throwInvalidState
 * @description Throws when a rule state is unknown or unsupported.
 */
function throwInvalidState(state: unknown): never {
  throw new Error(`Invalid rule state: ${String(state)}`);
}

/**
 * @function throwInvalidRuleField
 * @description Throws when a required rule field is missing or invalid.
 */
function throwInvalidRuleField(field: string, value: unknown): never {
  throw new Error(`Invalid rule field "${field}": ${String(value)}`);
}

/**
 * @function stringifyAtomicValue
 * @version 1.0.0
 *
 * @description
 * Ensures that an atomic rule value is a primitive CSS value.
 *
 * Responsibilities:
 * - accept only `string` or `number`
 * - reject structural wrapper objects (responsive, stateful, container, etc.)
 * - provide deterministic error messages for debugging compiler stages
 *
 * Non‑Responsibilities:
 * - expanding wrapper objects
 * - performing type coercion
 * - mutating the incoming rule
 *
 * Structural Rules:
 * - value must be fully resolved before emission
 * - wrapper objects must never reach this stage
 *
 * @param value The raw atomic rule value.
 * @returns A stringified primitive CSS value.
 * @throws If the value is not a primitive.
 */
function stringifyAtomicValue(value: AtomicRule["value"]): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  throw new Error(
    `AtomicRule.value must be a primitive at emission time. ` +
      `Received: ${JSON.stringify(value)}`,
  );
}

/* ============================================================================
 * Validation helpers
 * ==========================================================================*/

/**
 * @function validateClassName
 * @description Ensures the class name is non‑empty and contains no whitespace.
 */
function validateClassName(className: string): string {
  if (!className || WHITESPACE_REGEX.test(className)) {
    throwInvalidClassName(className);
  }
  return className;
}

/**
 * @function validateState
 * @description Ensures the rule state is either "base" or a known state key.
 */
function validateState(
  state: AtomicRule["state"],
): "base" | keyof typeof stateToSelector {
  if (!state || state === "base") return "base";

  if (!(state in stateToSelector)) {
    throwInvalidState(state);
  }

  return state as keyof typeof stateToSelector;
}

/**
 * @function validateRuleShape
 * @description Ensures required rule fields are structurally valid.
 */
function validateRuleShape(rule: AtomicRule): AtomicRule {
  if (!rule.property?.trim()) {
    throwInvalidRuleField("property", rule.property);
  }

  if (rule.value === undefined || rule.value === null || rule.value === "") {
    throwInvalidRuleField("value", rule.value);
  }

  return rule;
}

/* ============================================================================
 * Public API
 * ==========================================================================*/

/**
 * @function ruleToCSS
 * @description
 * Converts a normalized atomic rule into a complete CSS rule string.
 *
 * @param rule The atomic rule metadata.
 * @param className The hashed class name (without a leading dot).
 * @returns A fully‑formed CSS rule string.
 */
export function ruleToCSS(rule: AtomicRule, className: string): string {
  const safeRule = validateRuleShape(rule);
  const safeClassName = validateClassName(className);

  const selector = buildSelector(safeRule, safeClassName);
  const declaration = `${selector} { ${toKebab(safeRule.property)}: ${stringifyAtomicValue(safeRule.value)}; }`;

  const wrapper = resolveWrapper(safeRule);

  return wrapper ? `${wrapper} { ${declaration} }` : declaration;
}

/* ============================================================================
 * Selector builder (pipeline)
 * ==========================================================================*/

/**
 * @function buildSelector
 * @description Builds the final CSS selector for a rule.
 */
function buildSelector(rule: AtomicRule, className: string): string {
  const base = buildBaseSelector(className);
  const stateSelector = buildStateSelector(rule);

  return stateSelector ? base + stateSelector : base;
}

/**
 * @function buildBaseSelector
 * @description Builds the base class selector.
 */
function buildBaseSelector(className: string): string {
  return `${CLASS_PREFIX}${className}`;
}

/**
 * @function buildStateSelector
 * @description Resolves the state selector suffix for a rule, or an empty string.
 */
function buildStateSelector(rule: AtomicRule): string {
  const state = validateState(rule.state);
  if (state === "base") return "";

  const selector = stateToSelector[state];
  return selector ?? "";
}

/* ============================================================================
 * Wrapper resolution (pipeline)
 * ==========================================================================*/

/**
 * @function resolveWrapper
 * @description
 * Computes the correct wrapper for a rule using a pipeline of resolvers.
 *
 * @param rule The atomic rule metadata.
 * @returns A wrapper string or null.
 */
function resolveWrapper(rule: AtomicRule): string | null {
  for (const step of WRAPPER_PIPELINE) {
    const result = step(rule);
    if (result) return result;
  }
  return null;
}

/* --- Resolver steps ------------------------------------------------------- */

/**
 * @function wrapContainer
 * @description Resolves explicit container wrappers.
 */
function wrapContainer(rule: AtomicRule): string | null {
  return rule.container ?? null;
}

/**
 * @function wrapContainerMedia
 * @description Resolves container media queries (e.g., "@container (min-width: 500px)").
 */
function wrapContainerMedia(rule: AtomicRule): string | null {
  const bp = rule.breakpoint;
  return bp && isContainerMedia(bp) ? bp : null;
}

/**
 * @function buildMinMedia
 * @description
 * Produces a `min-width` media query wrapper.
 *
 * Structural rules:
 * - emits a single‑constraint viewport query
 * - used for lower‑bound breakpoints (e.g., `>= 768px`)
 *
 * @param px The minimum viewport width in pixels.
 * @returns A `@media` rule string.
 */
function buildMinMedia(px: number): string {
  return `@media (min-width: ${px}px)`;
}

/**
 * @function buildMaxMedia
 * @description
 * Produces a `max-width` media query wrapper.
 *
 * Structural rules:
 * - emits a single‑constraint viewport query
 * - used for upper‑bound breakpoints (e.g., `<= 1024px`)
 *
 * @param px The maximum viewport width in pixels.
 * @returns A `@media` rule string.
 */
function buildMaxMedia(px: number): string {
  return `@media (max-width: ${px}px)`;
}

/**
 * @function buildBetweenMedia
 * @description
 * Produces a `min-width` + `max-width` media query wrapper.
 *
 * Structural rules:
 * - emits a dual‑constraint viewport query
 * - used for bounded ranges (e.g., `768px–1024px`)
 *
 * @param min The minimum viewport width in pixels.
 * @param max The maximum viewport width in pixels.
 * @returns A `@media` rule string.
 */
function buildBetweenMedia(min: number, max: number): string {
  return `@media (min-width: ${min}px) and (max-width: ${max}px)`;
}

/**
 * @function wrapViewportBreakpoint
 * @description Resolves viewport breakpoints into @media queries.
 */
function wrapViewportBreakpoint(rule: AtomicRule): string | null {
  const bp = rule.breakpoint;
  if (!bp || isContainerMedia(bp)) return null;

  const resolved = resolveBreakpoint(bp);

  switch (resolved.type) {
    case "min":
      return buildMinMedia(resolved.min);
    case "max":
      return buildMaxMedia(resolved.max);
    case "between":
      return buildBetweenMedia(resolved.min, resolved.max);
    default:
      return null;
  }
}

/* --- Pipeline ------------------------------------------------------------- */

const WRAPPER_PIPELINE = [
  wrapContainer,
  wrapContainerMedia,
  wrapViewportBreakpoint,
] as const;
