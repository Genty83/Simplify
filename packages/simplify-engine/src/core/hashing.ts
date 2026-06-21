/******************************************************************************
 * @module simplify-engine/src/core/hashing
 * @version 1.1.1
 * @author Craig Gent
 *
 * @description
 * Deterministic hashing utilities for the Simplify engine.
 *
 * Responsibilities:
 * - produce stable, cross‑runtime hash strings
 * - support optional salt for multi‑app isolation
 * - generate canonical rule hashes for deduplication
 * - provide developer‑friendly long‑hash formats
 *
 * Non‑Responsibilities:
 * - generating CSS
 * - managing the registry
 * - interacting with the DOM
 *
 * Design Principles:
 * - pure and deterministic
 * - rectangular branching (no inference)
 * - stable output across runtimes and environments
 * - opt‑in enhancements that preserve backwards compatibility
 ***************************************************************************** */

/* ============================================================================
 * Constants
 * ==========================================================================*/

/** Regex: collapse multiple whitespace characters into a single space. */
const RE_MULTISPACE = /\s+/g;

/** Regex: normalize numeric formatting (e.g., "1.0" → "1"). */
const RE_TRAILING_ZERO_DECIMALS = /(\d+)(\.0+)(?!\d)/g;

/** Regex: replace separators (":" or whitespace) with hyphens. */
const RE_KEY_SEPARATORS = /[:\s]+/g;

/** Regex: strip all non‑alphanumeric and non‑hyphen characters. */
const RE_NON_ALPHANUMERIC = /[^a-zA-Z0-9-]/g;

/** Hash algorithm constants (documented to avoid magic numbers). */
const HASH_INITIAL = 0;
const UNSIGNED_INT_COERCION = 0; // bitwise shift to force 32‑bit integer
const HASH_MULTIPLIER = 31; // classic Java-style multiplier

/** Prefix applied to all Simplify‑generated rule hashes. */
const HASH_RULE_PREFIX = "sui-" as const;

/* ============================================================================
 * Internal State
 * ==========================================================================*/

/**
 * @internal
 * Salt prefix applied to all generated hashes.
 *
 * Used for:
 * - microfrontends
 * - multi‑app pages
 * - avoiding classname collisions across bundles
 */
let HASH_SALT = "";

/* ============================================================================
 * Public API
 * ==========================================================================*/

/**
 * @function setHashSalt
 * @description
 * Sets an optional salt prefix for all generated hashes.
 *
 * Structural rules:
 * - empty or falsy values clear the salt
 * - salt is applied as a prefix (`salt-<hash>`)
 * - does not mutate existing hashes
 *
 * @param salt A string prefix used to namespace all generated hashes.
 */
export function setHashSalt(salt: string): void {
  HASH_SALT = salt ? `${salt}-` : "";
}

/* ============================================================================
 * Input normalization
 * ==========================================================================*/

/**
 * @function normalizeInput
 * @description
 * Normalizes input strings to ensure stable hashing across environments.
 *
 * Structural rules:
 * - trims leading/trailing whitespace
 * - collapses multiple spaces into one
 * - normalizes numeric formatting (e.g., "1.0" → "1")
 *
 * @param input The raw input string.
 * @returns A normalized string safe for hashing.
 */
function normalizeInput(input: string): string {
  return input
    .trim()
    .replace(RE_MULTISPACE, " ")
    .replace(RE_TRAILING_ZERO_DECIMALS, "$1");
}

/* ============================================================================
 * Hashing primitives
 * ==========================================================================*/

/**
 * @function hashString
 * @description
 * Produces a deterministic, base‑36 encoded hash from an input string.
 *
 * Structural rules:
 * - uses a stable bit‑shift algorithm
 * - applies optional salt prefix
 * - normalization ensures cross‑runtime consistency
 *
 * Backwards‑compatible unless a salt is set.
 *
 * @param input The input string to hash.
 * @returns A base‑36 encoded hash string.
 */
export function hashString(input: string): string {
  const normalized = normalizeInput(input);
  const salted = HASH_SALT + normalized;

  let hash = HASH_INITIAL;

  for (let i = 0; i < salted.length; i++) {
    hash =
      (hash * HASH_MULTIPLIER + salted.charCodeAt(i)) >>> UNSIGNED_INT_COERCION;
  }

  return Math.abs(hash).toString(36);
}

/* ============================================================================
 * Rule hashing
 * ==========================================================================*/

/**
 * @function hashRuleKey
 * @description
 * Generates a namespaced hash for atomic rule keys.
 *
 * Structural rules:
 * - applies the `sui-` prefix
 * - uses normalized + salted hashing
 * - stable across runtimes
 *
 * @param key The canonical rule key string.
 * @returns A short, namespaced hash string.
 */
export function hashRuleKey(key: string): string {
  return HASH_RULE_PREFIX + hashString(key);
}

/**
 * @function hashRuleKeyLong
 * @description
 * Developer‑friendly hash format for debugging.
 *
 * Structural rules:
 * - normalizes the key
 * - replaces separators with hyphens
 * - strips unsafe characters
 * - appends the short hash for uniqueness
 *
 * Example:
 *   display:flex → sui-display-flex-k2f9s
 *
 * @param key The canonical rule key string.
 * @returns A readable, namespaced long hash string.
 */
export function hashRuleKeyLong(key: string): string {
  const normalized = normalizeInput(key)
    .replace(RE_KEY_SEPARATORS, "-")
    .replace(RE_NON_ALPHANUMERIC, "");

  return `${HASH_RULE_PREFIX}${normalized}-${hashString(key)}`;
}

/**
 * @function hashCanonicalRule
 * @description
 * Hashes a fully canonical rule object for deduplication.
 *
 * Structural rules:
 * - fields are joined in a fixed order
 * - missing optional fields become empty strings
 * - stable across runtimes and environments
 *
 * Example canonical form:
 *   {
 *     selector: ".sui-abc",
 *     property: "margin",
 *     value: "12px",
 *     media: "@media (min-width: 640px)",
 *     state: ":hover"
 *   }
 *
 * @param rule The canonical rule metadata.
 * @returns A namespaced hash string for deduplication.
 */
export function hashCanonicalRule(rule: {
  selector: string;
  property: string;
  value: string;
  media?: string;
  state?: string;
}): string {
  const canonical = JSON.stringify([
    rule.selector,
    rule.property,
    rule.value,
    rule.media ?? "",
    rule.state ?? "",
  ]);

  return HASH_RULE_PREFIX + hashString(canonical);
}
