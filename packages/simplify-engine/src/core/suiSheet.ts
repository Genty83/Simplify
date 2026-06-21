/******************************************************************************
 * @module simplify-engine/src/core/suiSheet
 * @version 1.1.0
 *
 * @description
 * High‑level sheet compiler for SimplifyUI.
 *
 * Responsibilities:
 * - iterate over all registered utilities
 * - provide sheet‑level context (breakpoints, container sizes, container mode)
 * - invoke each utility with its config slice
 * - collect atomic classnames from utility instances
 * - merge all classnames into a single, stable string
 * - expose `.asLayer()` for layer‑scoped stylesheet emission
 *
 * Non‑Responsibilities:
 * - generating CSS rules
 * - hashing or registering atomic rules
 * - interacting with the DOM
 *
 * Design Principles:
 * - pure and deterministic
 * - rectangular branching (no inference)
 * - utilities are the only source of atomic rule generation
 * - safe for SSR, workers, and edge runtimes
 ***************************************************************************** */

import { sui } from "./sui";
import { wrapInLayer } from "./stylesheet";
import { getRegisteredUtilities } from "../utilities/utilityRegistry";
import type {
  SuiSheetReturn,
  SheetInput,
  AnyContainerBreakpoint,
  UtilityFn,
  ContainerSizeMap,
} from "../types";
import { containerSizeMap } from "../config";

/* ============================================================================
 * Type Guards
 * ==========================================================================*/

/**
 * @function isRecord
 * @description Determines whether a value is a non‑null object.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * @function isContainerArray
 * @description Determines whether a value is an array of container breakpoints.
 */
function isContainerArray(
  value: unknown,
): value is readonly AnyContainerBreakpoint[] {
  return Array.isArray(value);
}

/* ============================================================================
 * Sheet‑Level Context
 * ==========================================================================*/

interface SheetContext {
  usingBreakpoints: string[];
  containerSizes: ContainerSizeMap;
  containerMode: boolean;
}

/**
 * @function extractBreakpoints
 * @description
 * Extracts the viewport breakpoints array from the sheet config.
 *
 * Structural rules:
 * - always returns an array
 * - always returns a shallow copy
 */
function extractBreakpoints(config: SheetInput): string[] {
  const list = config.usingBreakpoints;
  return Array.isArray(list) && list.length ? [...list] : [];
}

/**
 * @function extractContainerSizes
 * @description Extracts container sizes from the sheet config.
 */
function extractContainerSizes(config: SheetInput): ContainerSizeMap {
  return config.containerSizes ?? containerSizeMap;
}

/**
 * @function extractContainerMode
 * @description Determines whether this sheet is being rendered inside a container context.
 */
function extractContainerMode(config: SheetInput): boolean {
  return Boolean(config.isContainerChild);
}

/**
 * @function buildSheetContext
 * @description
 * Builds the sheet‑level context object used by all utilities.
 */
function buildSheetContext(config: SheetInput): SheetContext {
  return {
    usingBreakpoints: extractBreakpoints(config),
    containerSizes: extractContainerSizes(config),
    containerMode: extractContainerMode(config),
  };
}

/* ============================================================================
 * Utility Task Construction
 * ==========================================================================*/

interface UtilityTask {
  fn: UtilityFn;
  config: Record<string, unknown>;
  usingContainers: AnyContainerBreakpoint[];
}

/**
 * @function getUtilityConfig
 * @description
 * Safely extracts the config object for a specific utility.
 *
 * Returns `null` if the sheet does not define that utility.
 */
function getUtilityConfig(
  sheet: SheetInput,
  utilName: PropertyKey,
): Record<string, unknown> | null {
  const raw = (sheet as Record<PropertyKey, unknown>)[utilName];
  return isRecord(raw) ? raw : null;
}

/**
 * @function extractUsingContainers
 * @description
 * Extracts and normalizes the `usingContainers` array for a utility.
 */
function extractUsingContainers(
  utilConfig: Record<string, unknown>,
): AnyContainerBreakpoint[] {
  const raw = utilConfig.usingContainers;
  return isContainerArray(raw) ? [...raw] : [];
}

/**
 * @function buildUtilityTasks
 * @description
 * Builds a list of utility invocation tasks based on the sheet config.
 */
function buildUtilityTasks(sheet: SheetInput): UtilityTask[] {
  const tasks: UtilityTask[] = [];

  for (const [utilName, utilFn] of getRegisteredUtilities()) {
    const utilConfig = getUtilityConfig(sheet, utilName);
    if (!utilConfig) continue;

    tasks.push({
      fn: utilFn,
      config: utilConfig,
      usingContainers: extractUsingContainers(utilConfig),
    });
  }

  return tasks;
}

/* ============================================================================
 * Utility Invocation
 * ==========================================================================*/

/**
 * @function runUtility
 * @description
 * Invokes a registered utility with the correct sheet‑level context.
 *
 * Returns the atomic classname produced by the utility.
 */
function runUtility(
  utilFn: UtilityFn,
  utilConfig: Record<string, unknown>,
  usingBreakpoints: string[],
  usingContainers: AnyContainerBreakpoint[],
  containerMode: boolean,
  containerSizes: ContainerSizeMap,
): string {
  const instance = utilFn({
    ...utilConfig,
    usingBreakpoints,
    usingContainers,
    __containerMode: containerMode,
    __containerSizes: containerSizes,
  });

  return instance.atomize();
}

/**
 * @function runUtilityTasks
 * @description
 * Executes all utility tasks and collects their resulting classnames.
 */
function runUtilityTasks(
  tasks: UtilityTask[],
  context: SheetContext,
): string[] {
  const out: string[] = [];

  for (const task of tasks) {
    const className = runUtility(
      task.fn,
      task.config,
      context.usingBreakpoints,
      task.usingContainers,
      context.containerMode,
      context.containerSizes,
    );

    if (className) out.push(className);
  }

  return out;
}

/* ============================================================================
 * Classname Merging + Layer API
 * ==========================================================================*/

/**
 * @function mergeClassnames
 * @description Merges all utility‑generated classnames into a single string.
 */
function mergeClassnames(classes: string[]): string {
  return sui(...classes);
}

/**
 * @function attachLayerAPI
 * @description
 * Wraps a merged classname string in a string-like object that exposes
 * a non-enumerable `.asLayer()` method for CSS layer emission.
 *
 * This allows the return value of `suiSheet()` to behave like a string
 * in JSX while still supporting side-effectful layer registration.
 *
 * - The returned value is a `String` object (not a primitive string)
 * - It coerces to its primitive string value in most string contexts:
 *   - JSX className usage
 *   - template literals
 *   - string concatenation
 *
 * - It exposes `.asLayer(name)`:
 *   - Registers the classname under a CSS layer via `wrapInLayer`
 *   - Does NOT modify the underlying classname
 *   - Returns the primitive classname string
 *
 * - `.asLayer` is defined as:
 *   - non-enumerable
 *   - non-writable
 *   - non-configurable
 *
 * - This is a wrapper object, not a primitive string.
 * - Strict equality with primitives will fail:
 *   `sheet === "text"` → false
 * - Loose equality will coerce:
 *   `sheet == "text"` → true (due to valueOf coercion)
 *
 * - This design is intentional to preserve:
 *   - JSX ergonomics (`className={sheet}`)
 *   - API extension (`sheet.asLayer()`)
 *
 * @param base - The merged classname string produced by the sheet compiler.
 * @returns A string-like object with `.asLayer()` capability.
 */
function attachLayerAPI(base: string): SuiSheetReturn {
  const out = new String(base) as SuiSheetReturn;

  Object.defineProperty(out, "asLayer", {
    enumerable: false,
    configurable: false,
    writable: false,
    value(name: string): string {
      wrapInLayer(base, name);
      return base;
    },
  });

  return out;
}

/* ============================================================================
 * Main API
 * ==========================================================================*/

/**
 * @function suiSheet
 * @description
 * Builds a high‑level sheet instance from a declarative config object.
 *
 * Pipeline:
 * 1. Extract sheet‑level context
 * 2. Build utility invocation tasks
 * 3. Execute tasks to collect classnames
 * 4. Merge classnames and expose `.asLayer()`
 */
export function suiSheet(config: SheetInput): SuiSheetReturn {
  const context = buildSheetContext(config);
  const tasks = buildUtilityTasks(config);
  const classes = runUtilityTasks(tasks, context);

  const base = mergeClassnames(classes);
  return attachLayerAPI(base);
}
