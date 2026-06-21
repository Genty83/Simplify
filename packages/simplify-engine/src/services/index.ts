/**
 * @module simplify-engine/src/services
 * @version 1.0.0
 *
 * @description
 * Public entrypoint for the SimplifyUI service layer.
 *
 * This module consolidates and re‑exports all core service utilities:
 *
 * - responsive utilities (`rs`, breakpoints, viewport config)
 * - container query utilities (`cq`, container sizes)
 * - interaction state utilities (`state`, state expansion)
 * - keyframe generation (`keyframes`)
 * - accessibility helpers (`suiAria`, `ariaState`, `ariaLabel`, etc.)
 *
 * The goal of this index is to provide a stable, explicit, and predictable
 * public API surface for consumers of the SimplifyUI engine. No wildcard
 * exports are used — every symbol is intentionally exposed.
 *
 * @example
 * import { rs, cq, state, keyframes, suiAria } from "@simplify/services";
 */

//
// RESPONSIVE (viewport)
//
export {
  rs,
  autoRs,
  expandResponsiveValue,
  expandResponsive
} from "./responsive";

//
// CONTAINER QUERIES
//
export {
  // Detection
  isContainerBreakpoint,

  // Legacy + unified parser
  parseContainerQuery,

  // Utilities
  wrapInContainer,
  mapTupleToContainerSizes
} from "./cq";


//
// INTERACTION STATES
//
export {
  states,
  isStateful,
  isRawStateObject,
  expandStateObject,
  expandStateValue,
  autoStates
} from "./states";

//
// KEYFRAMES
//
export {
  keyframes,
  stepToCSS,
} from "./keyframes";

//
// ACCESSIBILITY (ARIA)
//
export {
  suiAria,
  ariaLabel,
  ariaHidden,
  ariaState,
} from "./suiAria";
