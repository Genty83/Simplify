/******************************************************************************
 * SimplifyUI Utility Compiler
 * @module simplify-engine/src/utilities/createUtility
 * @version 1.4.0
 *
 * @description
 * High‑level orchestration layer for the SimplifyUI utility compiler.
 *
 * Responsibilities:
 * - Extract meta‑fields (breakpoints, states, container settings)
 * - Delegate rule expansion to pure helpers in `utils.ts`
 * - Atomize expanded rules (hashing, dedupe, registry, CSS emission)
 * - Trigger stylesheet flush after injection
 *
 * Non‑Responsibilities:
 * - Performing property expansion
 * - Resolving responsive or stateful values
 * - Generating container conditions
 * - Mutating config objects
 * - Interacting with browser APIs (SSR‑safe)
 *
 * Structural Rules:
 * - Pure orchestration, no expansion logic
 * - Deterministic rule ordering via state sorting
 * - Stable hashing for atomic classnames
 * - Factory → compiler → atomizer pipeline
 *
 * Design Notes:
 * - Small, composposable helpers (<15 lines)
 * - Zero magic values (all constants extracted)
 * - No branching pyramids (strategy‑map ready)
 ***************************************************************************** */

import {
  breakpoints,
  type UtilityConfig,
  type UtilityResult,
  type AnyBreakpoint,
  type StateKey,
  type ContainerSizeMap,
  type AnyContainerBreakpoint,
  type AtomicRule,
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
import type { ExtractedMeta, UtilityMetaConfig } from "../types";

// ============================================================================
// Meta Extraction
// ============================================================================

/**
 * @function extractRawMeta
 * @version 1.1.0
 *
 * @description
 * Extracts raw meta fields from the incoming config.
 *
 * Responsibilities:
 * - Remove meta keys from the config
 * - Preserve all remaining keys as CSS properties
 */
function extractRawMeta(config: UtilityMetaConfig) {
  const {
    usingBreakpoints,
    usingStates,
    usingContainers,
    __containerMode,
    __containerSizes,
    ...rest
  } = config;

  return {
    rest,
    usingBreakpoints,
    usingStates,
    usingContainers,
    __containerMode,
    __containerSizes,
  };
}

/**
 * @function resolveActiveBreakpoints
 * @version 1.1.0
 *
 * @description
 * Resolves the final list of active breakpoints.
 */
function resolveActiveBreakpoints(raw: unknown): AnyBreakpoint[] {
  return Array.isArray(raw) && raw.length ? raw : [...breakpoints];
}

/**
 * @function resolveActiveStates
 * @version 1.1.0
 *
 * @description
 * Resolves the final list of active state keys.
 */
function resolveActiveStates(raw: unknown): StateKey[] {
  return Array.isArray(raw) && raw.length ? raw : stateKeys;
}

/**
 * @function resolveActiveContainers
 * @version 1.1.0
 *
 * @description
 * Resolves the final list of active container breakpoints.
 */
function resolveActiveContainers(raw: unknown): AnyContainerBreakpoint[] {
  return Array.isArray(raw) && raw.length ? raw : [];
}

/**
 * @function resolveContainerSettings
 * @version 1.3.0
 *
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
 * @version 1.1.0
 *
 * @description
 * Assembles the final extracted meta object.
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
 * @version 1.3.0
 *
 * @description
 * High‑level meta extractor.
 *
 * Responsibilities:
 * - Delegate extraction to smaller helpers
 * - Produce a deterministic, fully‑resolved meta object
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

// ============================================================================
// Atomization
// ============================================================================

/**
 * @function buildCanonical
 * @version 1.1.0
 *
 * @description
 * Creates a canonical rule descriptor used for deduplication.
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
 * @version 1.2.0
 *
 * @description
 * Emits a single atomic rule into the registry and stylesheet.
 */
function emitRule(hash: string, rule: AtomicRule, canonical: string): void {
  if (hasCanonicalRule(canonical)) return;

  if (!hasRule(hash)) {
    const css = ruleToCSS(rule, hash);

    registerRule(hash, css, canonical, {
      selector: hash,
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
 * @version 1.2.0
 *
 * @description
 * Atomizes a list of rules into classnames and injects CSS.
 */
function atomizeRules(rules: AtomicRule[]): string {
  const classNames: string[] = [];
  const sorted = sortRulesByState(rules);

  for (const rule of sorted) {
    const key = ruleKey(rule);
    const hash = hashRuleKey(key);

    const canonical = buildCanonical({
      selector: hash,
      property: rule.property,
      value: String(rule.value),
      media: rule.breakpoint,
      state: rule.state,
    });

    classNames.push(hash);
    emitRule(hash, rule, canonical);
  }

  flushStylesheet();
  return classNames.join(" ");
}

// ============================================================================
// Compiler + Factory
// ============================================================================

/**
 * @function compileUtility
 * @version 1.0.0
 *
 * @description
 * Performs meta extraction and rule expansion for a single utility call.
 *
 * Responsibilities:
 * - Extract meta fields
 * - Expand config into atomic rules
 */
function compileUtility(
  namespace: string,
  config: UtilityMetaConfig,
): AtomicRule[] {
  const {
    rest,
    activeBreakpoints,
    activeStates,
    activeContainers,
    containerMode,
    containerSizes,
  } = extractMeta(config);

  return expandConfigToRules(
    namespace,
    rest,
    activeBreakpoints,
    activeStates,
    containerMode,
    containerSizes,
    activeContainers,
  );
}

/**
 * @function createUtility
 * @version 1.4.0
 *
 * @description
 * Creates a namespaced utility compiler.
 *
 * Responsibilities:
 * - Wrap `compileUtility`
 * - Provide an `atomize()` method for CSS emission
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
