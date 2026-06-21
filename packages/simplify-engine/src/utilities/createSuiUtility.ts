/******************************************************************************
 * SimplifyUI Semantic Utility Creator
 * @module simplify-engine/src/utilities/createSuiUtility
 * @version 1.4.0
 *
 * @description
 * High‑level ergonomic utility creator used by the public `sui.*` API.
 *
 * Responsibilities:
 * - Apply semantic → CSS property mapping
 * - Normalize values through responsive expansion (`autoRs`)
 * - Forward meta‑fields (breakpoints, containers, container mode)
 * - Delegate rule compilation + atomization to `createUtility`
 *
 * Structural Rules:
 * - Pure mapping + normalization layer
 * - No mutation of incoming props
 * - Deterministic mapping order
 ***************************************************************************** */

import {
  breakpoints,
  type UtilityResult,
  type ContainerSizeMap,
  type BreakpointGraph,
  type AnyContainerBreakpoint,
} from "../types";

import { autoRs } from "../services";
import { createUtility } from "./createUtility";

// ============================================================================
// Types
// ============================================================================

type SuiMetaProps = {
  usingBreakpoints?: unknown;
  usingContainers?: unknown;
  __containerMode?: unknown;
  __containerSizes?: unknown;
};

// ============================================================================
// 1. Raw Meta Extraction
// ============================================================================

/**
 * @function extractRawMeta
 * @version 1.0.0
 *
 * @description
 * Extracts meta fields and returns the remaining semantic props.
 */
function extractRawMeta(props: Record<string, unknown>) {
  const {
    usingBreakpoints,
    usingContainers,
    __containerMode,
    __containerSizes,
    ...rest
  } = props;

  return {
    rest,
    usingBreakpoints,
    usingContainers,
    __containerMode,
    __containerSizes,
  };
}

// ============================================================================
// 2. Breakpoint Resolution
// ============================================================================

/**
 * @function resolveBreakpointGraph
 * @version 1.0.0
 *
 * @description
 * Resolves the active breakpoint graph.
 */
function resolveBreakpointGraph(raw: unknown): BreakpointGraph {
  return Array.isArray(raw) && raw.length ? raw : [...breakpoints];
}

// ============================================================================
// 3. Container Breakpoint Resolution
// ============================================================================

/**
 * @function resolveContainerBreakpoints
 * @version 1.0.0
 *
 * @description
 * Resolves the active container breakpoint list.
 */
function resolveContainerBreakpoints(raw: unknown): AnyContainerBreakpoint[] {
  return Array.isArray(raw) ? raw : [];
}

// ============================================================================
// 4. Container Mode + Size Map Resolution
// ============================================================================

/**
 * @function resolveContainerSizes
 * @version 1.0.0
 *
 * @description
 * Validates and returns a `ContainerSizeMap` or `null`.
 */
function resolveContainerSizes(sizes: unknown): ContainerSizeMap | null {
  if (!sizes || typeof sizes !== "object" || Array.isArray(sizes)) return null;

  const record = sizes as Record<string, unknown>;
  const out: ContainerSizeMap = {};

  for (const key in record) {
    const v = record[key];
    if (typeof v !== "string") return null;
    out[key] = v;
  }

  return out;
}

/**
 * @function resolveContainerMode
 * @version 1.0.0
 *
 * @description
 * Resolves container mode flag.
 */
function resolveContainerMode(mode: unknown): boolean {
  return mode === true;
}

/**
 * @function resolveContainerSettings
 * @version 1.3.0
 *
 * @description
 * Combines container mode + size map resolution.
 */
function resolveContainerSettings(
  mode: unknown,
  sizes: unknown,
): { containerMode: boolean; containerSizes: ContainerSizeMap | null } {
  return {
    containerMode: resolveContainerMode(mode),
    containerSizes: resolveContainerSizes(sizes),
  };
}

// ============================================================================
// 5. Semantic → CSS Property Mapping
// ============================================================================

/**
 * @function applyPropMapping
 * @version 1.0.0
 *
 * @description
 * Applies semantic → CSS property mapping.
 */
function applyPropMapping(
  raw: Record<string, unknown>,
  map?: Record<string, string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key in raw) {
    out[map?.[key] ?? key] = raw[key];
  }
  return out;
}

// ============================================================================
// 6. Responsive Normalization
// ============================================================================

/**
 * @function normalizeValues
 * @version 1.0.0
 *
 * @description
 * Normalizes all mapped values via `autoRs()`.
 */
function normalizeValues(
  mapped: Record<string, unknown>,
  bp: BreakpointGraph,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key in mapped) {
    out[key] = autoRs(mapped[key], bp);
  }
  return out;
}

// ============================================================================
// 7. Public API: createSuiUtility()
// ============================================================================

/**
 * @function createSuiUtility
 * @version 1.4.0
 *
 * @description
 * Creates a high‑level ergonomic utility function for the public `sui.*` API.
 */
export function createSuiUtility<
  T extends Partial<SuiMetaProps> & object
>(domain: string, propMap?: Record<string, string>) {
  return function utility(props: T): UtilityResult {
    const raw = extractRawMeta(props as Record<string, unknown>);

    const bp = resolveBreakpointGraph(raw.usingBreakpoints);
    const containers = resolveContainerBreakpoints(raw.usingContainers);
    const { containerMode, containerSizes } = resolveContainerSettings(
      raw.__containerMode,
      raw.__containerSizes,
    );

    const mapped = applyPropMapping(raw.rest, propMap);
    const normalized = normalizeValues(mapped, bp);

    return createUtility(domain)({
      ...normalized,
      usingBreakpoints: [...bp],
      usingContainers: [...containers],
      __containerMode: containerMode,
      __containerSizes: containerSizes,
    });
  };
}
