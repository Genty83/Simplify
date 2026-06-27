/******************************************************************************
 * SimplifyUI Utility Registry
 * @module simplify-engine/src/utilities/utilityRegistry
 * @version 1.2.0
 *
 * @description
 * Internal registry for SimplifyUI utility factories.
 *
 * Responsibilities:
 * - Store typed utility factories keyed by namespace
 * - Provide deterministic registration via `registerUtility`
 * - Expose a controlled read‑only view of all registered utilities
 *
 * Non‑Responsibilities:
 * - Validating utility factory implementations
 * - Transforming or mutating utility output
 * - Generating CSS or atomic rules
 * - Interacting with browser APIs (SSR‑safe)
 *
 * Structural Rules:
 * - Registry is a single in‑memory map
 * - Registration overwrites existing entries deterministically
 * - Retrieval returns the internal map without cloning
 * - Callers must treat the returned map as read‑only
 *
 * Design Notes:
 * - Pure, deterministic, and structural
 * - Zero side effects beyond explicit registration
 * - Strongly typed against `RegisteredUtilities`
 * - Minimal surface area (register + retrieve)
 ***************************************************************************** */

import type { RegisteredUtilities, UtilityFactory } from "../types";

/**
 * @constant utilityRegistry
 * @version 1.0.0
 *
 * @description
 * Internal map storing all registered utility factories.
 *
 * Structural Rules:
 * - Keys must be valid `RegisteredUtilities` namespaces
 * - Values must be typed `UtilityFactory` instances
 * - Map is intentionally not cloned or frozen
 */
const utilityRegistry = new Map<
  keyof RegisteredUtilities,
  UtilityFactory<any>
>();

// ============================================================================
// REGISTRATION
// ============================================================================

/**
 * @function registerUtility
 * @version 1.2.0
 *
 * @description
 * Registers a utility factory under a given namespace.
 *
 * Responsibilities:
 * - Associate a namespace with a typed utility factory
 * - Overwrite existing entries deterministically
 *
 * Non‑Responsibilities:
 * - Validating the factory implementation
 * - Preventing duplicate or conflicting registrations
 *
 * Structural Rules:
 * - `name` must be a key of `RegisteredUtilities`
 * - `factory` must accept the corresponding props type
 *
 * @example
 * registerUtility("layout", suiLayout);
 *
 * @param name
 * The unique namespace for the utility.
 *
 * @param factory
 * The factory function responsible for generating atomic rules.
 */
export function registerUtility<Name extends keyof RegisteredUtilities>(
  name: Name,
  factory: UtilityFactory<RegisteredUtilities[Name]>
): void {
  utilityRegistry.set(name, factory);
}


// ============================================================================
// RETRIEVAL
// ============================================================================

/**
 * @function getRegisteredUtilities
 * @version 1.1.0
 *
 * @description
 * Returns the internal map of all registered utilities.
 *
 * Responsibilities:
 * - Provide a stable reference to the registry
 *
 * Non‑Responsibilities:
 * - Cloning or freezing the registry
 * - Enforcing immutability on callers
 *
 * Structural Rules:
 * - Returned map must be treated as read‑only by consumers
 * - All registration must occur via `registerUtility`
 *
 * @example
 * const utilities = getRegisteredUtilities();
 * for (const [name, factory] of utilities) {
 *   console.log(name, factory);
 * }
 *
 * @returns
 * A map of all registered utility factories keyed by utility name.
 */
export function getRegisteredUtilities(): ReadonlyMap<
  keyof RegisteredUtilities,
  UtilityFactory<any>
> {
  return utilityRegistry;
}
