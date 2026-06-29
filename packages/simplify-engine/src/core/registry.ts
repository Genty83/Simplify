/******************************************************************************
 * @module simplify-engine/src/core/registry
 * @version 2.0.0
 * @author
 *   SimplifyUI Engineering — Craig Gent
 *
 * @description
 * Internal atomic CSS rule registry for the Simplify engine.
 *
 * Responsibilities:
 * - Store compiled atomic CSS rules
 * - Ensure deduplication via hashed keys
 * - Support canonical rule dedupe across utilities
 * - Preserve deterministic insertion order
 * - Expose metadata for debugging/devtools
 * - Support SSR serialization
 *
 * Non‑Responsibilities:
 * - Injecting CSS into the DOM
 * - Managing style tags
 * - Performing hydration or SSR logic
 *
 * Design Principles:
 * - Pure and synchronous
 * - Rectangular branching (no inference)
 * - Deterministic ordering via Map
 * - Minimal surface area for higher‑level systems
 ******************************************************************************/

export interface RuleMetadata {
  property: string;
  value: string;
  selector: string; // ← real selector (override or hash)
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
 *
 * Structural rules:
 * - Hash remains the dedupe key
 * - Selector inside RuleEntry is the real selector (override or hash)
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

export function hasRule(hash: string): boolean {
  return ruleRegistry.has(hash);
}

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
 * - Hash remains the dedupe key
 * - Selector stored in metadata is the real selector (override or hash)
 * - Canonical hashes populate the canonical registry
 * - Metadata is optional and used for devtools/debugging
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
  // Store real selector in metadata (override or hash)
  const entry: RuleEntry = {
    css,
    canonicalHash,
    meta,
  };

  ruleRegistry.set(hash, entry);

  if (canonicalHash) {
    const count = canonicalRegistry.get(canonicalHash) ?? 0;
    canonicalRegistry.set(canonicalHash, count + 1);
  }
}

/* ============================================================================
 * RETRIEVAL
 * ==========================================================================*/

export function getRule(hash: string): string | undefined {
  return ruleRegistry.get(hash)?.css;
}

export function getAllRules(): ReadonlyMap<string, RuleEntry> {
  return new Map(ruleRegistry);
}

/* ============================================================================
 * DELETION
 * ==========================================================================*/

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

export function clearRegistry(): void {
  ruleRegistry.clear();
  canonicalRegistry.clear();
}

/* ============================================================================
 * METRICS
 * ==========================================================================*/

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
 * - Concatenates rules in insertion order
 * - Appends newline after each rule
 * - Returns both CSS and count
 *
 * Useful for:
 * - SSR frameworks (Next.js, Remix, Astro)
 * - Static extraction
 * - Testing
 */
export function serializeRules(): { css: string; count: number } {
  let css = "";
  for (const entry of ruleRegistry.values()) {
    css += entry.css + "\n";
  }
  return { css, count: ruleRegistry.size };
}
