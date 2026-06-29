/******************************************************************************
 * @module simplify-engine/src/core/suiSheet
 * @version 2.2.0
 * @author
 *   SimplifyUI Engineering — Craig Gent
 *
 * @description
 * High‑level sheet compiler for SimplifyUI.
 *
 * Responsibilities:
 * - Iterate over all registered utilities
 * - Provide sheet‑level context (breakpoints, container sizes, container mode)
 * - Invoke each utility with its config slice
 * - Collect atomic classnames from utility instances
 * - Merge all classnames into a single, stable string
 * - Expose `.asLayer()` for layer‑scoped stylesheet emission
 * - Expand `globals` selector maps into utility tasks targeting real selectors
 *   via `selectorOverride`
 *
 * Global Selector Pipeline:
 * - `globals` maps selectors → utility configs
 * - Each selector produces utility tasks with `selectorOverride`
 * - Utilities pass `__selectorOverride` into `expandConfigToRules`
 * - Atomic rules receive `selectorOverride`
 * - Compiler emits rules using override instead of hashed classname
 *
 * Non‑Responsibilities:
 * - Generating CSS rules
 * - Hashing or registering atomic rules
 * - Interacting with the DOM
 *
 * Design Principles:
 * - Pure and deterministic
 * - Rectangular branching (no inference)
 * - Utilities are the only source of atomic rule generation
 * - Safe for SSR, workers, and edge runtimes
 *****************************************************************************/

import { sui } from "./sui";
import { wrapInLayer } from "./stylesheet";
import { getRegisteredUtilities } from "../utilities/utilityRegistry";
import { containerSizeMap } from "../config";

import type {
  SuiSheetReturn,
  SheetInput,
  AnyContainerBreakpoint,
  UtilityFn,
  ContainerSizeMap,
} from "../types";

/* ============================================================================
 * Type Guards
 * ==========================================================================*/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

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

function extractBreakpoints(config: SheetInput): string[] {
  const list = config.usingBreakpoints;
  return Array.isArray(list) && list.length ? [...list] : [];
}

function extractContainerSizes(config: SheetInput): ContainerSizeMap {
  return config.containerSizes ?? containerSizeMap;
}

function extractContainerMode(config: SheetInput): boolean {
  return Boolean(config.isContainerChild);
}

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
  selectorOverride?: string;
}

function getUtilityConfig(
  sheet: SheetInput,
  utilName: PropertyKey,
): Record<string, unknown> | null {
  const raw = (sheet as Record<PropertyKey, unknown>)[utilName];
  return isRecord(raw) ? raw : null;
}

function extractUsingContainers(
  utilConfig: Record<string, unknown>,
): AnyContainerBreakpoint[] {
  const raw = (utilConfig as Record<string, unknown>).usingContainers;
  return isContainerArray(raw) ? [...raw] : [];
}

/**
 * @description
 * Component‑scoped utilities (layout, surface, etc.)
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
      selectorOverride: undefined,
    });
  }

  return tasks;
}

/**
 * @description
 * Global utilities — selector → utility config
 *
 * Example:
 * globals: {
 *   body: { layout: { padding: 20 } }
 * }
 *
 * Produces tasks with:
 *   selectorOverride = "body"
 */
function buildGlobalTasks(sheet: SheetInput): UtilityTask[] {
  const tasks: UtilityTask[] = [];
  const globals = sheet.globals;
  if (!globals) return tasks;

  for (const selector of Object.keys(globals)) {
    const selectorConfig = globals[selector];
    if (!selectorConfig || !isRecord(selectorConfig)) continue;

    for (const [utilName, utilFn] of getRegisteredUtilities()) {
      const utilConfig = (selectorConfig as Record<PropertyKey, unknown>)[
        utilName
      ];
      if (!isRecord(utilConfig)) continue;

      const config = utilConfig as Record<string, unknown>;

      tasks.push({
        fn: utilFn,
        config,
        usingContainers: extractUsingContainers(config),
        selectorOverride: selector,
      });
    }
  }

  return tasks;
}

/* ============================================================================
 * Utility Invocation
 * ==========================================================================*/

/**
 * @description
 * Invokes a utility with sheet‑level context.
 *
 * For global tasks:
 * - `selectorOverride` is passed through
 * - atomic rules target real selectors instead of hashed classnames
 */
function runUtility(
  utilFn: UtilityFn,
  utilConfig: Record<string, unknown>,
  usingBreakpoints: string[],
  usingContainers: AnyContainerBreakpoint[],
  containerMode: boolean,
  containerSizes: ContainerSizeMap,
  selectorOverride?: string,
): string {
  const instance = utilFn({
    ...utilConfig,
    usingBreakpoints,
    usingContainers,
    __containerMode: containerMode,
    __containerSizes: containerSizes,
    __selectorOverride: selectorOverride,
  });

  return instance.atomize();
}

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
      task.selectorOverride,
    );

    if (className) out.push(className);
  }

  return out;
}

/* ============================================================================
 * Classname Merging + Layer API
 * ==========================================================================*/

function mergeClassnames(classes: string[]): string {
  return sui(...classes);
}

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

export function suiSheet(config: SheetInput): SuiSheetReturn {
  const context = buildSheetContext(config);

  const componentTasks = buildUtilityTasks(config);
  const globalTasks = buildGlobalTasks(config);

  const tasks =
    componentTasks.length || globalTasks.length
      ? [...componentTasks, ...globalTasks]
      : [];

  const classes = tasks.length ? runUtilityTasks(tasks, context) : [];
  const base = mergeClassnames(classes);

  return attachLayerAPI(base);
}
