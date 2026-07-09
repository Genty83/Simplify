/******************************************************************************
 * @module simplify-engine/src/config
 * @version 1.1.0
 *
 * @description
 * Central configuration constants for the SimplifyUI engine.
 *
 * This module defines the canonical breakpoint map, container size map,
 * ARIA state → attribute mappings, state keys, state → selector mappings,
 * and state priority ordering.
 *
 * All values are:
 * - deterministic
 * - rectangular (no missing keys)
 * - engine‑safe
 *
 * @remarks
 * This file contains no logic. It is pure configuration and safe to
 * serialize, diff, and statically analyze.
 ***************************************************************************** */

import type { StateKey, ContainerSizeMap } from "../types"
import { ariaStateMap } from "../ariaApi"

// ============================================================================
// BREAKPOINT MAP (Viewport)
// ============================================================================

/**
 * @description
 * Canonical viewport breakpoint map used by the responsive engine.
 */
export const defaultBreakpointMap = {
  mobile: 0,
  tablet: 640,
  laptop: 1024,
  desktop: 1280,
  monitor: 1536,
  wide: 1920
}

// ============================================================================
// CONTAINER SIZE MAP (Container Queries)
// ============================================================================

/**
 * @description
 * Canonical container size map used for container queries.
 */
export const containerSizeMap: ContainerSizeMap = {
  default: "0px",
  small: "400px",
  medium: "600px",
  large: "900px"
}

// ============================================================================
// STATE KEYS
// ============================================================================

/**
 * @description
 * Ordered list of all supported state keys.
 *
 * @remarks
 * Order here does not determine priority. Priority is defined separately.
 */
export const stateKeys: StateKey[] = [
  "base",
  "hover",
  "pressed",
  "focus",
  "focusVisible",
  "focusWithin",
  "active",
  "disabled",

  // ARIA states (must match ariaStateMap keys)
  "ariaExpanded",
  "ariaSelected",
  "ariaChecked",
  "ariaPressed",
  "ariaDisabled",
  "ariaCurrent",
  "ariaBusy",

  // Data states
  "dataOpen",
  "dataActive",
  "dataDisabled",

  "custom"
]

// ============================================================================
// STATE SELECTOR MAP
// ============================================================================

/**
 * @description
 * Maps each state key to its corresponding CSS selector.
 *
 * ARIA selectors are generated from `ariaStateMap` to ensure consistency.
 */
export const stateToSelector: Record<StateKey, string | null> = {
  base: "",
  hover: ":hover",
  pressed: ":active",
  active: ":active",
  focus: ":focus",
  focusVisible: ":focus-visible",
  focusWithin: ":focus-within",

  disabled: "[disabled]",

  // ARIA states
  ariaExpanded: `[${ariaStateMap.ariaExpanded}="true"]`,
  ariaSelected: `[${ariaStateMap.ariaSelected}="true"]`,
  ariaChecked: `[${ariaStateMap.ariaChecked}="true"]`,
  ariaPressed: `[${ariaStateMap.ariaPressed}="true"]`,
  ariaDisabled: `[${ariaStateMap.ariaDisabled}="true"]`,
  ariaCurrent: `[${ariaStateMap.ariaCurrent}="true"]`,
  ariaBusy: `[${ariaStateMap.ariaBusy}="true"]`,

  // Data states
  dataOpen: `[data-open="true"]`,
  dataActive: `[data-active="true"]`,
  dataDisabled: `[data-disabled="true"]`,

  custom: null
}

// ============================================================================
// STATE PRIORITY MAP
// ============================================================================

/**
 * @description
 * Defines the priority ordering for state resolution.
 *
 * Higher numbers = higher priority.
 */
export const statePriority: Record<StateKey, number> = {
  base: 0,

  hover: 10,
  focus: 20,
  focusVisible: 25,
  focusWithin: 27,

  active: 30,
  pressed: 30,

  // ARIA states
  ariaExpanded: 40,
  ariaSelected: 40,
  ariaChecked: 40,
  ariaPressed: 40,
  ariaCurrent: 40,
  ariaBusy: 40,

  // Data states
  dataOpen: 50,
  dataActive: 50,
  dataDisabled: 50,

  disabled: 100,
  ariaDisabled: 100,

  custom: 999
}
