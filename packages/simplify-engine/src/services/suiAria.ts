/******************************************************************************
 * @module simplify-engine/src/core/suiAria
 * @version 1.1.1
 *
 * @description
 * Accessibility helpers for SimplifyUI components.
 *
 * Responsibilities:
 * - structural ARIA wrapper (`suiAria`)
 * - ergonomic ARIA attribute helpers
 * - boolean ARIA state emission (`ariaState`)
 *
 * Non‑Responsibilities:
 * - validating ARIA roles
 * - inferring ARIA attributes automatically
 * - depending on DOM or environment features
 *
 * Design notes:
 * - deterministic, structural output
 * - prototype‑free objects
 * - minimal, explicit attribute emission
 ***************************************************************************** */

import type { Role, AriaAttributes } from "../types"
import { ariaStateMap } from "../config"

// ============================================================================
// MAIN WRAPPER
// ============================================================================

/**
 * @function suiAria
 * @description
 * Produces a structural object containing a WAI‑ARIA role and/or ARIA attributes.
 *
 * Structural rules:
 * - emits only explicitly provided keys
 * - returns a plain, prototype‑free object
 * - no inference or automatic attribute generation
 *
 * @param config The role and ARIA attributes to emit.
 * @returns A structural object suitable for spreading into JSX or DOM props.
 */
export function suiAria(config: { role?: Role; aria?: AriaAttributes }) {
  return {
    ...(config.role ? { role: config.role } : {}),
    ...(config.aria ?? {})
  }
}

// ============================================================================
// ERGONOMIC HELPERS
// ============================================================================

/**
 * @function ariaLabel
 * @description
 * Emits an `aria-label` attribute.
 *
 * @param label The accessible label text.
 * @returns A structural object containing the attribute.
 */
export function ariaLabel(label: string) {
  return { "aria-label": label }
}

/**
 * @function ariaHidden
 * @description
 * Emits an `aria-hidden` attribute.
 *
 * @param hidden Whether the element is hidden from assistive technologies.
 * @returns A structural object containing the attribute.
 */
export function ariaHidden(hidden: boolean = true) {
  return { "aria-hidden": hidden }
}

// ============================================================================
// BOOLEAN STATE HELPERS
// ============================================================================

/**
 * @function ariaState
 * @description
 * Emits ARIA boolean state attributes based on the provided configuration.
 *
 * Structural rules:
 * - uses `ariaStateMap` from global config (single source of truth)
 * - emits only explicitly provided keys
 * - returns a prototype‑free structural object
 * - no inference: missing keys are ignored, not defaulted
 *
 * @example
 * ariaState({ ariaDisabled: true, ariaExpanded: false })
 * // → { "aria-disabled": true, "aria-expanded": false }
 *
 * @param states A partial map of ARIA state booleans.
 * @returns A structural object containing the emitted ARIA attributes.
 */
export function ariaState(
  states: Partial<Record<keyof typeof ariaStateMap, boolean>>
) {
  const out: Record<string, boolean> = {}

  for (const [stateKey, ariaAttr] of Object.entries(ariaStateMap)) {
    const typedKey = stateKey as keyof typeof ariaStateMap
    const value = states[typedKey]

    if (value !== undefined) {
      out[ariaAttr] = value
    }
  }

  return out
}

