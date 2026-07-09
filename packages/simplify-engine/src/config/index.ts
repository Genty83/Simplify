/**
 * @module simplify-engine/src/config
 * @version 1.0.0
 *
 * @description
 * Public entrypoint for the SimplifyUI configuration subsystem.
 *
 * This module exposes the canonical configuration constants used throughout
 * the engine, including:
 *
 * - viewport breakpoint map
 * - container size map
 * - state keys
 * - state → selector mappings
 * - state priority ordering
 *
 * Exports are **explicit by design**:
 * - No wildcard (`export *`) re‑exports
 * - No accidental API surface expansion
 * - No leaking of internal or experimental configuration
 *
 * This ensures:
 * - Deterministic public contracts
 * - Predictable versioning
 * - Clear separation between internal and public modules
 *
 * @example
 * import { breakpointMap, stateToSelector } from "@simplify/config";
 */

export {
  defaultBreakpointMap,
  containerSizeMap,
  stateKeys,
  stateToSelector,
  statePriority,
} from "./config";
