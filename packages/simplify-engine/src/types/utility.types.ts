/******************************************************************************
 * @module simplify-engine/types/utility
 * @version 1.1.0
 *
 * @description
 * Utility system type contracts for the SimplifyUI engine.
 *
 * This module defines:
 * - `UtilityConfig` — input shape for a utility namespace
 * - `UtilityResult` — output shape containing atomic rules + atomizer
 * - `RegisteredUtilities` — registry of all runtime utilities
 * - `UtilityFn<T>` — runtime contract for a utility implementation
 * - `UtilityFactory<T>` — typed factory for user‑facing utility creators
 *
 * These types form the backbone of the SimplifyUI utility pipeline.
 * They depend only on:
 * - `AtomicRule` for compiled output
 *
 * This file contains **no runtime logic** and is safe for static analysis.
 ***************************************************************************** */

import type { AtomicRule } from "./atomic.types";
import type { SuiValue } from "./primitive.types";
import type { AnyBreakpoint } from "./breakpoints.types";
import type { AnyContainerBreakpoint, ContainerSizeMap } from "./container.types";
import type { StateKey } from "./states.types";

import type { 
  SuiLayoutProps,
  SuiShapeProps,
  SuiSurfaceProps,
  SuiSizingProps,
  SuiMotionProps,
  SuiInteractionProps,
  SuiTypographyProps,
  SuiSpacingProps 
} from "../language";

// ============================================================================
// Utility Configuration
// ============================================================================

/**
 * @description
 * Configuration object for a utility namespace.
 *
 * Each key maps to a `SuiValue` (primitive, responsive, or stateful).
 * Typed as `Record<string, unknown>` to avoid importing SuiValue and
 * creating dependency cycles.
 */
export type UtilityConfig = Record<string, SuiValue<unknown>>;

// ============================================================================
// Utility Result
// ============================================================================

/**
 * @description
 * Result of processing a utility namespace.
 *
 * A utility produces:
 * - a list of atomic rules
 * - an `.atomize()` method that returns a merged classname string
 *
 * The `__utility` tag ensures runtime safety and deterministic shape.
 */
export interface UtilityResult {
  __utility: true;
  rules: AtomicRule[];
  atomize(): string;
}

// ============================================================================
// Registered Utilities
// ============================================================================

/**
 * @description
 * Registry of all utilities created at runtime.
 *
 * Each key corresponds to a utility namespace (e.g., `layout`, `surface`,
 * `shape`, `motion`, etc.) and maps to the config type expected by that
 * utility.
 *
 * This interface is augmented by each language module via declaration merging.
 */
export interface RegisteredUtilities {
  layout: SuiLayoutProps,
  motion: SuiMotionProps,
  sizing: SuiSizingProps,
  shape: SuiShapeProps,
  spacing: SuiSpacingProps,
  surface: SuiSurfaceProps,
  interaction: SuiInteractionProps,
  typography: SuiTypographyProps
}

// ============================================================================
// Utility Function Contract
// ============================================================================

/**
 * @description
 * A runtime utility function registered in the Simplify engine.
 *
 * Each utility receives a fully‑merged config object and returns a
 * `UtilityResult` instance exposing `.atomize()`.
 *
 * This is the core contract used by:
 * - `utilityRegistry`
 * - `suiSheet()`
 * - `suiLayout()`
 */
export type UtilityFn = (
  config: Record<string, unknown>
) => UtilityResult;

// ============================================================================
// Typed Utility Factory
// ============================================================================

/**
 * @description
 * A typed factory function for Simplify utilities.
 *
 * Each utility created via `createSuiUtility<T>()` produces a factory that
 * accepts a specific props type `T` and returns a `UtilityResult`.
 *
 * This type is intentionally identical to `UtilityFn<T>` but kept separate
 * for semantic clarity.
 */
export type UtilityFactory<T> = (config: T) => UtilityResult;


// ============================================================================
// Utility Meta Configuration
// ============================================================================

/**
 * @type UtilityMetaConfig
 * @description
 * Configuration object for a utility namespace extended with meta fields
 * consumed by the utility compiler.
 *
 * Meta fields:
 * - `usingBreakpoints` — explicit breakpoint activation list
 * - `usingStates` — explicit state activation list
 * - `usingContainers` — explicit container breakpoint list
 * - `__containerMode` — enables container‑query mode
 * - `__containerSizes` — container size map for container queries
 *
 * @example
 * const cfg: UtilityMetaConfig = {
 *   usingBreakpoints: ["mobile", "desktop"],
 *   usingStates: ["hover", "pressed"],
 *   display: "flex",
 *   gap: 12
 * };
 *
 * @notes
 * - Extends `UtilityConfig` without widening types.
 * - All meta fields are optional and resolved by the compiler.
 * - Internal fields (`__container*`) are compiler‑only and not user‑facing.
 */
export type UtilityMetaConfig = UtilityConfig & {
  usingBreakpoints?: AnyBreakpoint[];
  usingStates?: StateKey[];
  usingContainers?: AnyContainerBreakpoint[];
  __containerMode?: boolean;
  __containerSizes?: ContainerSizeMap | null;
};

// ============================================================================
// Extracted Meta Payload
// ============================================================================

/**
 * @type ExtractedMeta
 * @description
 * Fully‑resolved meta payload produced by the utility compiler.
 *
 * Contains:
 * - `rest` — remaining CSS properties after meta extraction
 * - `activeBreakpoints` — final breakpoint list
 * - `activeStates` — final state list
 * - `activeContainers` — final container breakpoint list
 * - `containerMode` — resolved container mode flag
 * - `containerSizes` — resolved container size map
 *
 * @example
 * const meta: ExtractedMeta = {
 *   rest: { display: "flex", gap: 12 },
 *   activeBreakpoints: ["mobile", "desktop"],
 *   activeStates: ["hover"],
 *   activeContainers: [],
 *   containerMode: false,
 *   containerSizes: null
 * };
 *
 * @notes
 * - Produced exclusively by the compiler (never user‑authored).
 * - Guarantees deterministic, fully‑normalized meta data.
 * - Consumed by rule expansion and atomization layers.
 */
export type ExtractedMeta = {
  rest: UtilityConfig;
  activeBreakpoints: AnyBreakpoint[];
  activeStates: StateKey[];
  activeContainers: AnyContainerBreakpoint[];
  containerMode: boolean;
  containerSizes: ContainerSizeMap | null;
};

