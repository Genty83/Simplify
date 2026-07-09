/**
 * @module simplify-engine/src/types
 * @version 1.0.0
 *
 * @description
 * Public entrypoint for the SimplifyUI core type system.
 *
 * This module consolidates and re‑exports all foundational type contracts
 * used across the Simplify engine: breakpoints, responsive values, stateful
 * values, atomic rules, utilities, keyframes, and container queries.
 *
 * Exports are **explicit by design**:
 * - No wildcard (`export *`) re‑exports
 * - No accidental API surface expansion
 * - No leaking of internal or experimental types
 *
 * This ensures:
 * - Deterministic public contracts
 * - Predictable versioning
 * - Clear separation between internal and public modules
 *
 * @example
 * import { Breakpoint, ResponsiveValue } from "@simplify/types";
 */

// ---------------------------------------------------------------------------
// Breakpoints
// ---------------------------------------------------------------------------

export {
  breakpoints,
  type Breakpoint,
  type InlineBreakpoint,
  type MaxBreakpoint,
  type BetweenBreakpoint,
  type AnyBreakpoint,
  type BreakpointGraph,
} from "./breakpoints.types";

// ---------------------------------------------------------------------------
// Responsive
// ---------------------------------------------------------------------------

export {
  type ResponsiveEntry,
  type ExpandResponsiveValue,
  type ResponsiveInput,
} from "./responsive.types";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export {
  type PrimitiveValue,
  type ResponsivePrimitive,
  type ResponsiveWrapper,
  type ResponsiveValue,
  type TupleResponsive,
  type SuiValue
} from "./primitive.types";

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------

export {
  type StateKey,
  type StateLeaf,
  type StateValue,
  type StateWrapper,
} from "./states.types";

// ---------------------------------------------------------------------------
// Atomic Rules
// ---------------------------------------------------------------------------

export { type AtomicRule } from "./atomic.types";

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export {
  type UtilityConfig,
  type UtilityResult,
  type RegisteredUtilities,
  type UtilityFactory,
  type UtilityFn,
  type UtilityMetaConfig,
  type ExtractedMeta
} from "./utility.types";

// ---------------------------------------------------------------------------
// Keyframes
// ---------------------------------------------------------------------------

export {
  type KeyframeStep,
  type KeyframesDefinition,
  type KeyframesResult,
} from "./keyframes.types";

// ---------------------------------------------------------------------------
// Container Queries
// ---------------------------------------------------------------------------

export {
  type ContainerSizeMap,
  type ContainerSize,
  type InlineContainerBreakpoint,
  type BetweenContainerBreakpoint,
  type NamedContainerBreakpoint,
  type AnyContainerBreakpoint,
  type ContainerBreakpointGraph,
  type ContainerQueryDSL,
} from "./container.types";

// ---------------------------------------------------------------------------
// Sheets
// ---------------------------------------------------------------------------

export {
  type SuiSheetReturn,
  type SheetInput,
} from "./sheet.types";

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export { type RuleRegistry } from "./registry.types";