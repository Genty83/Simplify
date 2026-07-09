/******************************************************************************
 * @module simplify-engine/src/utilities/utils
 * @version 1.1.0
 *
 * @description
 * Deterministic expansion engine for SimplifyUI utilities.
 *
 * Responsibilities:
 * - Normalize raw values into CSS‑safe primitives
 * - Expand responsive values into breakpoint layers
 * - Expand stateful values into state layers
 * - Apply container‑query wrapping when required
 * - Construct stable atomic rule objects
 *
 * Non‑Responsibilities:
 * - Generating CSS strings
 * - Accessing the DOM or browser APIs
 * - Mutating global state
 * - Performing side effects
 *
 * Structural Rules:
 * - All helpers are pure and deterministic
 * - No helper exceeds ~15 lines
 * - No branching pyramids (strategy‑map pattern preferred)
 * - No magic values (all constants extracted)
 * - Atomic rule construction is stable and rectangular
 *
 * Design Principles:
 * - Functional composition
 * - Predictable expansion order
 * - Zero inference or mutation of user config
 * - SSR‑safe at all layers
 ***************************************************************************** */

import {
  type AtomicRule,
  type UtilityConfig,
  type AnyBreakpoint,
  type StateKey,
  type AnyContainerBreakpoint,
  type ContainerSizeMap,
} from "../types";

import {
  isStateful,
  expandStateValue,
  expandResponsiveValue,
} from "../services";

import { parseContainerQuery } from "../services";
import { isPaint, resolvePaint } from "../paintApi";
import { normalize } from "../core";

// ============================================================================
// Constants
// ============================================================================

const META_USING_BREAKPOINTS = "usingBreakpoints";
const META_USING_STATES = "usingStates";
const META_USING_CONTAINERS = "usingContainers";

const META_KEYS = new Set([
  META_USING_BREAKPOINTS,
  META_USING_STATES,
  META_USING_CONTAINERS,
]);

const ERR_INVALID_VALUE =
  "Invalid utility value. Expected a primitive, paint token, state object, or responsive structure.";

const ERR_INVALID_CONFIG =
  "Invalid utility config. Expected a flat object of CSS properties and values.";

const ERR_MISSING_CONTAINER_SIZES =
  "Container mode requires a valid container size map.";

// ============================================================================
// Error Helpers
// ============================================================================

/**
 * @function throwInvalidValue
 * @version 1.0.0
 *
 * @description
 * Throws when a utility value is not a valid structure.
 *
 * Responsibilities:
 * - Provide a deterministic error path for invalid values
 *
 * Non‑Responsibilities:
 * - Attempting to coerce or repair invalid input
 */
function throwInvalidValue(): never {
  throw new Error(ERR_INVALID_VALUE);
}

/**
 * @function throwInvalidConfig
 * @version 1.0.0
 *
 * @description
 * Throws when a utility config contains invalid keys or shapes.
 */
function throwInvalidConfig(): never {
  throw new Error(ERR_INVALID_CONFIG);
}

/**
 * @function throwMissingContainerSizes
 * @version 1.0.0
 *
 * @description
 * Throws when container mode is enabled but no size map is provided.
 */
function throwMissingContainerSizes(): never {
  throw new Error(ERR_MISSING_CONTAINER_SIZES);
}

// ============================================================================
// Value Resolution
// ============================================================================

/**
 * @function resolveValue
 * @version 1.1.0
 *
 * @description
 * Normalizes a raw utility value into a CSS‑safe primitive.
 *
 * Responsibilities:
 * - Resolve paint tokens
 * - Normalize primitives
 *
 * Structural Rules:
 * - Always returns a string or number
 */
export function resolveValue(value: unknown): string | number {
  if (isPaint(value)) {
    return resolvePaint(value.token, value.options);
  }
  return normalize(value);
}

// ============================================================================
// Atomic Rule Construction
// ============================================================================

/**
 * @function createAtomicRule
 * @version 1.1.0
 *
 * @description
 * Constructs a stable atomic rule object.
 *
 * Structural Rules:
 * - All fields are explicit
 * - Value is normalized before assignment
 */
function createAtomicRule(
  namespace: string,
  property: string,
  value: unknown,
  breakpoint?: AnyBreakpoint,
  state?: StateKey,
  container?: string,
): AtomicRule {
  return {
    namespace,
    property,
    value: resolveValue(value),
    breakpoint,
    state,
    container,
  };
}

/**
 * @function pushRule
 * @version 1.1.0
 *
 * @description
 * Appends a constructed atomic rule to the rule list.
 *
 * Non‑Responsibilities:
 * - Deduplication
 * - Sorting
 */
export function pushRule(
  rules: AtomicRule[],
  namespace: string,
  property: string,
  value: unknown,
  breakpoint?: AnyBreakpoint,
  state?: StateKey,
  container?: string,
): void {
  rules.push(
    createAtomicRule(namespace, property, value, breakpoint, state, container),
  );
}

// ============================================================================
// Container Helpers
// ============================================================================

/**
 * @function resolveContainerCondition
 * @version 1.1.0
 *
 * @description
 * Converts a container breakpoint into a CSS condition string.
 *
 * Structural Rules:
 * - Returns `undefined` when no container breakpoint is provided
 * - Throws when container mode is active but no size map exists
 */
function resolveContainerCondition(
  bp: AnyContainerBreakpoint | null,
  sizes: ContainerSizeMap | null,
): string | undefined {
  if (!bp) return undefined;
  if (!sizes) throwMissingContainerSizes();
  return parseContainerQuery(bp, sizes);
}

/**
 * @function containerAtIndex
 * @version 1.0.0
 *
 * @description
 * Retrieves the container breakpoint for a given responsive index.
 */
function containerAtIndex(
  usingContainers: AnyContainerBreakpoint[],
  index: number,
): AnyContainerBreakpoint | null {
  return usingContainers[index] ?? null;
}

// ============================================================================
// Layer Expansion
// ============================================================================

/**
 * @function expandSingleLayer
 * @version 1.1.0
 *
 * @description
 * Expands a single responsive layer into one or more atomic rules.
 *
 * Structural Rules:
 * - Container wrapping takes precedence over breakpoint assignment
 */
function expandSingleLayer(
  rules: AtomicRule[],
  namespace: string,
  property: string,
  layer: { value: unknown; breakpoint?: AnyBreakpoint },
  state: StateKey | undefined,
  containerMode: boolean,
  containerSizes: ContainerSizeMap | null,
  containerBp: AnyContainerBreakpoint | null,
): void {
  const containerCondition = resolveContainerCondition(containerBp, containerSizes);

  if (containerCondition) {
    pushRule(rules, namespace, property, layer.value, undefined, state, containerCondition);
    return;
  }

  if (containerMode && layer.breakpoint) {
    const wrapped = resolveContainerCondition(
      layer.breakpoint as AnyContainerBreakpoint,
      containerSizes,
    );
    pushRule(rules, namespace, property, layer.value, undefined, state, wrapped);
    return;
  }

  pushRule(rules, namespace, property, layer.value, layer.breakpoint, state);
}

/**
 * @function expandResponsiveLayers
 * @version 1.1.0
 *
 * @description
 * Expands all responsive layers for a given value.
 */
function expandResponsiveLayers(
  rules: AtomicRule[],
  namespace: string,
  property: string,
  value: unknown,
  activeBreakpoints: AnyBreakpoint[],
  state: StateKey | undefined,
  containerMode: boolean,
  containerSizes: ContainerSizeMap | null,
  usingContainers: AnyContainerBreakpoint[],
): void {
  const layers = expandResponsiveValue(value, activeBreakpoints);

  layers.forEach((layer, index) => {
    const containerBp = containerAtIndex(usingContainers, index);
    expandSingleLayer(
      rules,
      namespace,
      property,
      layer,
      state,
      containerMode,
      containerSizes,
      containerBp,
    );
  });
}

/**
 * @function expandStateLayers
 * @version 1.1.0
 *
 * @description
 * Expands stateful values into state‑specific responsive layers.
 */
function expandStateLayers(
  rules: AtomicRule[],
  namespace: string,
  property: string,
  rawValue: { value: unknown },
  activeBreakpoints: AnyBreakpoint[],
  activeStates: StateKey[],
  containerMode: boolean,
  containerSizes: ContainerSizeMap | null,
  usingContainers: AnyContainerBreakpoint[],
): void {
  const entries = expandStateValue(rawValue.value, activeStates);

  entries.forEach(([state, stateValue]) => {
    expandResponsiveLayers(
      rules,
      namespace,
      property,
      stateValue,
      activeBreakpoints,
      state,
      containerMode,
      containerSizes,
      usingContainers,
    );
  });
}

// ============================================================================
// Property Expansion
// ============================================================================

/**
 * @function expandProperty
 * @version 1.1.0
 *
 * @description
 * Expands a single property into atomic rules.
 *
 * Structural Rules:
 * - Nullish values are invalid
 * - Stateful values are expanded before responsive values
 */
export function expandProperty(
  rules: AtomicRule[],
  namespace: string,
  property: string,
  rawValue: unknown,
  activeBreakpoints: AnyBreakpoint[],
  activeStates: StateKey[],
  containerMode: boolean,
  containerSizes: ContainerSizeMap | null,
  usingContainers: AnyContainerBreakpoint[],
): void {
  if (rawValue === null || rawValue === undefined) throwInvalidValue();

  if (isStateful(rawValue)) {
    expandStateLayers(
      rules,
      namespace,
      property,
      rawValue,
      activeBreakpoints,
      activeStates,
      containerMode,
      containerSizes,
      usingContainers,
    );
    return;
  }

  expandResponsiveLayers(
    rules,
    namespace,
    property,
    rawValue,
    activeBreakpoints,
    undefined,
    containerMode,
    containerSizes,
    usingContainers,
  );
}

// ============================================================================
// Config Expansion
// ============================================================================

/**
 * @function expandConfigToRules
 * @version 1.1.0
 *
 * @description
 * Expands a utility config object into a flat list of atomic rules.
 *
 * Structural Rules:
 * - Meta keys (`usingBreakpoints`, `usingStates`, `usingContainers`) are ignored
 * - Config must be a flat object
 */
export function expandConfigToRules(
  namespace: string,
  config: UtilityConfig,
  activeBreakpoints: AnyBreakpoint[],
  activeStates: StateKey[],
  containerMode: boolean,
  containerSizes: ContainerSizeMap | null,
  usingContainers: AnyContainerBreakpoint[],
  selectorOverride?: string,            // ← NEW
): AtomicRule[] {
  if (typeof config !== "object" || config === null) throwInvalidConfig();

  const rules: AtomicRule[] = [];
  const typed = config as Record<string, unknown>;

  for (const property in typed) {
    if (META_KEYS.has(property)) continue;

    expandProperty(
      rules,
      namespace,
      property,
      typed[property],
      activeBreakpoints,
      activeStates,
      containerMode,
      containerSizes,
      usingContainers,
    );
  }

  // Attach selector override to every rule
  if (selectorOverride) {
    for (const rule of rules) {
      (rule as any).selectorOverride = selectorOverride;
    }
  }

  return rules;
}

