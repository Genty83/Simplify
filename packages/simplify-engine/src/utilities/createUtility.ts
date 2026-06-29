/******************************************************************************
 * SimplifyUI Utility Compiler
 * @module simplify-engine/src/utilities/createUtility
 * @version 2.0.0
 * @author
 *   SimplifyUI Engineering — Craig Gent
 *
 * @description
 * High‑level orchestration layer for the SimplifyUI utility compiler.
 *
 * This module coordinates the full utility compilation pipeline:
 *
 * 1. Extract meta‑fields (breakpoints, states, container settings)
 * 2. Extract selector overrides for global rules
 * 3. Expand raw config objects into deterministic atomic rule lists
 * 4. Atomize rules (hashing, dedupe, registry insertion, CSS emission)
 * 5. Flush the stylesheet after each injection
 *
 * Responsibilities:
 * - Pure orchestration (no expansion logic)
 * - Deterministic rule ordering via state sorting
 * - Stable hashing for atomic classnames
 * - Selector override propagation for global sheets
 * - SSR‑safe at all layers
 *
 * Non‑Responsibilities:
 * - Performing property expansion (delegated to `utils.ts`)
 * - Generating CSS strings (delegated to `ruleToCSS`)
 * - Interacting with the DOM (delegated to stylesheet engine)
 * - Mutating user config objects
 *
 * Design Principles:
 * - Small, composable helpers (<15 lines)
 * - Zero magic values (all constants extracted)
 * - No branching pyramids (strategy‑map ready)
 * - Deterministic, rectangular pipelines
 ******************************************************************************/

import {
  breakpoints,
  type UtilityConfig,
  type UtilityResult,
  type AnyBreakpoint,
  type StateKey,
  type ContainerSizeMap,
  type AnyContainerBreakpoint,
  type AtomicRule,
  type UtilityMetaConfig,
  type ExtractedMeta,
} from "../types";

import { expandConfigToRules } from "./utils";

import {
  hasRule,
  registerRule,
  ruleKey,
  ruleToCSS,
  flushStylesheet,
  injectCSS,
  sortRulesByState,
  hashRuleKey,
  hashCanonicalRule,
  hasCanonicalRule,
} from "../core";

import { stateKeys } from "../config";

/* ============================================================================
 * Meta Extraction
 * ==========================================================================*/

/**
 * @function extractRawMeta
 * @description
 * Extracts raw meta fields from the incoming config and returns the remaining
 * CSS properties as `rest`.
 *
 * Structural Rules:
 * - Meta keys are removed from the config
 * - Remaining keys are treated as CSS properties
 */
function extractRawMeta(config: UtilityMetaConfig) {
  const {
    usingBreakpoints,
    usingStates,
    usingContainers,
    __containerMode,
    __containerSizes,
    __selectorOverride,
    ...rest
  } = config;

  return {
    rest,
    usingBreakpoints,
    usingStates,
    usingContainers,
    __containerMode,
    __containerSizes,
    __selectorOverride,
  };
}

/**
 * @function resolveActiveBreakpoints
 * @description
 * Resolves the final list of active breakpoints.
 *
 * Structural Rules:
 * - Defaults to all breakpoints when none are provided
 */
function resolveActiveBreakpoints(raw: unknown): AnyBreakpoint[] {
  return Array.isArray(raw) && raw.length ? raw : [...breakpoints];
}

/**
 * @function resolveActiveStates
 * @description
 * Resolves the final list of active state keys.
 *
 * Structural Rules:
 * - Defaults to all known state keys
 */
function resolveActiveStates(raw: unknown): StateKey[] {
  return Array.isArray(raw) && raw.length ? raw : stateKeys;
}

/**
 * @function resolveActiveContainers
 * @description
 * Resolves the final list of active container breakpoints.
 *
 * Structural Rules:
 * - Defaults to an empty list
 */
function resolveActiveContainers(raw: unknown): AnyContainerBreakpoint[] {
  return Array.isArray(raw) && raw.length ? raw : [];
}

/**
 * @function resolveContainerSettings
 * @description
 * Resolves container mode and container size map.
 *
 * Structural Rules:
 * - Mode defaults to `false`
 * - Size map defaults to `null`
 * - Only plain objects with string values qualify as `ContainerSizeMap`
 */
function resolveContainerSettings(
  mode: unknown,
  sizes: unknown,
): { containerMode: boolean; containerSizes: ContainerSizeMap | null } {
  const containerMode = mode === true;

  if (sizes && typeof sizes === "object" && !Array.isArray(sizes)) {
    const record = sizes as Record<string, unknown>;
    const out: ContainerSizeMap = {};

    for (const key in record) {
      const v = record[key];
      if (typeof v !== "string") return { containerMode, containerSizes: null };
      out[key] = v;
    }

    return { containerMode, containerSizes: out };
  }

  return { containerMode, containerSizes: null };
}

/**
 * @function buildExtractedMeta
 * @description
 * Assembles the final extracted meta object.
 *
 * Structural Rules:
 * - All fields are explicit
 * - No inference or mutation
 */
function buildExtractedMeta(
  rest: UtilityConfig,
  activeBreakpoints: AnyBreakpoint[],
  activeStates: StateKey[],
  activeContainers: AnyContainerBreakpoint[],
  containerMode: boolean,
  containerSizes: ContainerSizeMap | null,
): ExtractedMeta {
  return {
    rest,
    activeBreakpoints,
    activeStates,
    activeContainers,
    containerMode,
    containerSizes,
  };
}

/**
 * @function extractMeta
 * @description
 * High‑level meta extractor.
 *
 * Structural Rules:
 * - Returns ONLY ExtractedMeta
 * - Selector override is intentionally excluded and handled separately
 */
function extractMeta(config: UtilityMetaConfig): ExtractedMeta {
  const raw = extractRawMeta(config);

  const activeBreakpoints = resolveActiveBreakpoints(raw.usingBreakpoints);
  const activeStates = resolveActiveStates(raw.usingStates);
  const activeContainers = resolveActiveContainers(raw.usingContainers);

  const { containerMode, containerSizes } = resolveContainerSettings(
    raw.__containerMode,
    raw.__containerSizes,
  );

  return buildExtractedMeta(
    raw.rest,
    activeBreakpoints,
    activeStates,
    activeContainers,
    containerMode,
    containerSizes,
  );
}

/* ============================================================================
 * Atomization
 * ==========================================================================*/

/**
 * @function buildCanonical
 * @description
 * Creates a canonical rule descriptor used for deduplication.
 *
 * Structural Rules:
 * - Canonical selector is the real selector (override or hash)
 * - Canonical hashing is stable and deterministic
 */
function buildCanonical(rule: {
  selector: string;
  property: string;
  value: string;
  media?: AnyBreakpoint;
  state?: StateKey;
}) {
  return hashCanonicalRule(rule);
}

/**
 * @function emitRule
 * @description
 * Emits a single atomic rule into the registry and stylesheet.
 *
 * Structural Rules:
 * - Registry key is always the hashed classname
 * - CSS selector is override OR hashed classname
 * - No mutation of rule objects
 */
function emitRule(
  hash: string,
  rule: AtomicRule,
  selector: string,
  canonical: string,
): void {
  if (hasCanonicalRule(canonical)) return;

  if (!hasRule(hash)) {
    const css = ruleToCSS(rule, selector);

    registerRule(hash, css, canonical, {
      selector,
      property: rule.property,
      value: String(rule.value),
      media: rule.breakpoint,
      state: rule.state,
    });

    injectCSS(css);
  }
}

/**
 * @function atomizeRules
 * @description
 * Atomizes a list of rules into classnames and injects CSS.
 *
 * Structural Rules:
 * - Sorted by state priority
 * - Selector override takes precedence over hashed classname
 */
function atomizeRules(rules: AtomicRule[]): string {
  const classNames: string[] = [];
  const sorted = sortRulesByState(rules);

  for (const rule of sorted) {
    const key = ruleKey(rule);
    const hash = hashRuleKey(key);

    const override = (rule as any).selectorOverride as string | undefined;
    const selector = override ?? hash;

    const canonical = buildCanonical({
      selector,
      property: rule.property,
      value: String(rule.value),
      media: rule.breakpoint,
      state: rule.state,
    });

    classNames.push(hash);
    emitRule(hash, rule, selector, canonical);
  }

  flushStylesheet();
  return classNames.join(" ");
}

/* ============================================================================
 * Compiler + Factory
 * ==========================================================================*/

/**
 * @function compileUtility
 * @description
 * Performs meta extraction and rule expansion for a single utility call.
 *
 * Structural Rules:
 * - Selector override is extracted directly from config
 * - Meta extraction remains unchanged
 * - Rule expansion is pure and deterministic
 * - Selector override is attached to each rule
 */
function compileUtility(
  namespace: string,
  config: UtilityMetaConfig,
): AtomicRule[] {
  const selectorOverride =
    typeof config.__selectorOverride === "string"
      ? config.__selectorOverride.trim()
      : undefined;

  const {
    rest,
    activeBreakpoints,
    activeStates,
    activeContainers,
    containerMode,
    containerSizes,
  } = extractMeta(config);

  const rules = expandConfigToRules(
    namespace,
    rest,
    activeBreakpoints,
    activeStates,
    containerMode,
    containerSizes,
    activeContainers,
    selectorOverride,
  );

  return rules;
}

/**
 * @function createUtility
 * @description
 * Creates a namespaced utility compiler.
 *
 * Structural Rules:
 * - Returns a stable utility instance
 * - `atomize()` performs full CSS emission
 * - Selector override is fully supported
 */
export function createUtility(namespace: string) {
  return function utility(config: UtilityMetaConfig): UtilityResult {
    const rules = compileUtility(namespace, config);

    return {
      __utility: true,
      rules,
      atomize() {
        return atomizeRules(rules);
      },
    };
  };
}
