/******************************************************************************
 * @module simplify-engine/src/core/registry
 * @version 1.2.0
 * @author
 *   SimplifyUI Engineering — Craig Gent
 *
 * @description
 * Internal atomic CSS rule registry for the Simplify engine.
 *
 * Responsibilities:
 * - store compiled atomic CSS rules
 * - ensure deduplication via hashed keys
 * - support canonical rule dedupe across utilities
 * - preserve deterministic insertion order
 * - expose metadata for debugging/devtools
 * - support SSR serialization
 *
 * Non‑Responsibilities:
 * - injecting CSS into the DOM
 * - managing style tags
 * - performing hydration or SSR logic
 *
 * Design Principles:
 * - pure and synchronous
 * - rectangular branching (no inference)
 * - deterministic ordering via Map
 * - minimal surface area for higher‑level systems
 ***************************************************************************** */

export interface RuleMetadata {
  property: string;
  value: string;
  selector: string;
  media?: string;
  state?: string;
}

export interface RuleEntry {
  css: string;
  canonicalHash?: string;
  meta?: RuleMetadata;
}

/* ============================================================================
 * Internal State
 * ==========================================================================*/

/**
 * @internal
 * Primary registry of atomic CSS rules.
 *
 * Keys: hashed rule key (e.g., "sui-k2f9s")
 * Values: RuleEntry objects
 */
const ruleRegistry = new Map<string, RuleEntry>();

/**
 * @internal
 * Canonical registry for cross‑utility dedupe.
 *
 * Stores only canonical hashes for O(1) lookup.
 */
const canonicalRegistry = new Map<string, number>();

/* ============================================================================
 * QUERY
 * ==========================================================================*/

/**
 * @function hasRule
 * @description
 * Checks whether a rule hash already exists in the registry.
 *
 * Structural rules:
 * - lookup is O(1)
 * - no inference or fallback
 *
 * @param hash The hashed rule key.
 * @returns `true` if the rule exists.
 */
export function hasRule(hash: string): boolean {
  return ruleRegistry.has(hash);
}

/**
 * @function hasCanonicalRule
 * @description
 * Checks whether a canonical rule hash already exists.
 *
 * Structural rules:
 * - lookup is O(1) via Set
 * - used for cross‑utility deduplication
 *
 * @param canonicalHash The canonical hash for a rule.
 * @returns `true` if a matching canonical rule exists.
 */
export function hasCanonicalRule(canonicalHash: string): boolean {
  return canonicalRegistry.has(canonicalHash);
}

/* ============================================================================
 * INSERTION
 * ==========================================================================*/

/**
 * @function registerRule
 * @description
 * Registers a compiled CSS rule in the registry.
 *
 * Structural rules:
 * - overwrites existing entries with the same hash
 * - canonical hashes populate the canonical registry
 * - metadata is optional and used for devtools/debugging
 *
 * @param hash The hashed rule key.
 * @param css The compiled CSS string.
 * @param canonicalHash Optional canonical hash for dedupe.
 * @param meta Optional metadata describing the rule.
 */
export function registerRule(
  hash: string,
  css: string,
  canonicalHash?: string,
  meta?: RuleMetadata,
): void {
  ruleRegistry.set(hash, { css, canonicalHash, meta });

  if (canonicalHash) {
    const count = canonicalRegistry.get(canonicalHash) ?? 0;
    canonicalRegistry.set(canonicalHash, count + 1);
  }
}

/* ============================================================================
 * RETRIEVAL
 * ==========================================================================*/

/**
 * @function getRule
 * @description
 * Retrieves a CSS rule by its hash.
 *
 * Structural rules:
 * - returns only the CSS string
 * - does not expose metadata
 *
 * @param hash The hashed rule key.
 * @returns The CSS string or `undefined` if not found.
 */
export function getRule(hash: string): string | undefined {
  return ruleRegistry.get(hash)?.css;
}

/**
 * @function getAllRules
 * @description
 * Returns a read‑only snapshot of the entire rule registry.
 *
 * Structural rules:
 * - preserves insertion order
 * - returns a shallow copy to prevent external mutation
 * - exposes full RuleEntry objects
 *
 * @returns A read‑only `Map` of all registered rules.
 */
export function getAllRules(): ReadonlyMap<string, RuleEntry> {
  return new Map(ruleRegistry);
}

/* ============================================================================
 * DELETION
 * ==========================================================================*/

/**
 * @function deleteRule
 * @description
 * Removes a rule from the registry.
 *
 * @param hash The hashed rule key.
 */
export function deleteRule(hash: string): void {
  const entry = ruleRegistry.get(hash);

  if (entry?.canonicalHash) {
    const current = canonicalRegistry.get(entry.canonicalHash);
    if (current !== undefined) {
      if (current <= 1) {
        canonicalRegistry.delete(entry.canonicalHash);
      } else {
        canonicalRegistry.set(entry.canonicalHash, current - 1);
      }
    }
  }

  ruleRegistry.delete(hash);
}

/**
 * @function clearRegistry
 * @description
 * Clears all rules from both registries.
 */
export function clearRegistry(): void {
  ruleRegistry.clear();
  canonicalRegistry.clear();
}

/* ============================================================================
 * METRICS
 * ==========================================================================*/

/**
 * @function getRuleCount
 * @description
 * Returns the number of registered rules.
 *
 * @returns The total number of rules in the registry.
 */
export function getRuleCount(): number {
  return ruleRegistry.size;
}

/* ============================================================================
 * SERIALIZATION (SSR)
 * ==========================================================================*/

/**
 * @function serializeRules
 * @description
 * Serializes all registered CSS rules into a single string.
 *
 * Structural rules:
 * - concatenates rules in insertion order
 * - appends newline after each rule
 * - returns both CSS and count
 *
 * Useful for:
 * - SSR frameworks (Next.js, Remix, Astro)
 * - static extraction
 * - testing
 *
 * @returns An object containing:
 * - `css`: concatenated CSS string
 * - `count`: number of rules
 */
export function serializeRules(): { css: string; count: number } {
  let css = "";
  for (const entry of ruleRegistry.values()) {
    css += entry.css + "\n";
  }
  return { css, count: ruleRegistry.size };
}
