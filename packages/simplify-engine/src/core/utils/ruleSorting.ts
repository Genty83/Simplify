/******************************************************************************
 * @module simplify-engine/src/core/utils/ruleSorting
 * @version 1.1.0
 * @author Craig Gent
 *
 * @description
 * Canonical key generation and deterministic structural sorting for atomic rules.
 *
 * Responsibilities:
 * - generate stable canonical keys for rule deduplication
 * - sort rules by state priority and structural fields
 *
 * Non‑Responsibilities:
 * - generating CSS
 * - managing the registry
 * - interacting with the DOM
 *
 * Design Principles:
 * - pure and deterministic
 * - rectangular branching (no inference)
 * - stable ordering guarantees predictable stylesheet output
 ******************************************************************************/

import type { AtomicRule } from "../../types";
import { statePriority } from "../../config";


export type RuleSortTuple = readonly [
  number,
  string,
  string,
  string,
  string
];

/* ============================================================================
 * Canonical key
 * ==========================================================================*/

/**
 * @function ruleKey
 * @description
 * Produces a stable canonical key for an atomic rule.
 *
 * Structural rules:
 * - all fields are stringified
 * - missing optional fields become empty strings
 * - ordering is fixed and never inferred
 *
 * @param {AtomicRule} rule
 *   The atomic rule metadata.
 *
 * @returns {string}
 *   A stable canonical key string suitable for deduplication.
 */
export function ruleKey(rule: AtomicRule): string {
  return JSON.stringify([
    rule.namespace,
    rule.property,
    rule.value,
    rule.breakpoint ?? "",
    rule.state ?? "",
  ]);
}

/* ============================================================================
 * State priority
 * ==========================================================================*/

/**
 * @function getStatePriority
 * @description
 * Resolves the numeric priority for a given rule state.
 *
 * Structural rules:
 * - missing or undefined states resolve to "base"
 * - unknown states fall back to priority 0
 * - no inference or transformation is applied
 *
 * @param {AtomicRule["state"]} state
 *   The optional state key from an atomic rule.
 *
 * @returns {number}
 *   The numeric priority for the state.
 */
function getStatePriority(state: AtomicRule["state"]): number {
  return statePriority[state ?? "base"] ?? 0;
}

/* ============================================================================
 * Normalization
 * ==========================================================================*/

/**
 * @function normalizeRule
 * @description
 * Normalizes an atomic rule into a fully‑defined structural record.
 *
 * Structural rules:
 * - optional fields normalize to empty strings
 * - state priority is resolved up front
 * - no inference or transformation
 *
 * @param {AtomicRule} rule The atomic rule to normalize.
 *
 * @returns 
 *   A normalized structural representation of the rule.
 */
function normalizeRule(rule: AtomicRule) {
  return {
    priority: getStatePriority(rule.state),
    namespace: rule.namespace,
    property: rule.property,
    value: rule.value,
    breakpoint: rule.breakpoint ?? "",
  };
}

/* ============================================================================
 * Tuple generation
 * ==========================================================================*/

/**
 * @function ruleSortTuple
 * @description
 * Produces the ordered tuple used for deterministic comparison.
 *
 * Ordering dimensions:
 * 1. state priority
 * 2. namespace
 * 3. property
 * 4. value
 * 5. breakpoint
 *
 * @param {AtomicRule} rule
 *   The atomic rule to convert into a sort tuple.
 *
 * @returns The tuple representing the rule's structural ordering dimensions.
 */
function ruleSortTuple(rule: AtomicRule) {
  const f = normalizeRule(rule);

  return [
    f.priority,
    f.namespace,
    f.property,
    f.value,
    f.breakpoint,
  ] as const;
}

/* ============================================================================
 * Comparator
 * ==========================================================================*/

/**
 * @function compareRules
 * @description
 * Lexicographically compares two atomic rules using their structural tuples.
 *
 * Structural rules:
 * - no branching beyond tuple iteration
 * - no inference or selector inspection
 * - stable, deterministic ordering
 *
 * @param {AtomicRule} a
 *   The first rule to compare.
 *
 * @param {AtomicRule} b
 *   The second rule to compare.
 *
 * @returns {number}
 *   A negative, zero, or positive number for sorting.
 */
function compareRules(a: AtomicRule, b: AtomicRule): number {
  const ta = ruleSortTuple(a);
  const tb = ruleSortTuple(b);

  for (let i = 0; i < ta.length; i++) {
    const av = ta[i];
    const bv = tb[i];

    const diff =
      typeof av === "number"
        ? (av as number) - (bv as number)
        : String(av).localeCompare(String(bv));

    if (diff !== 0) return diff;
  }

  return 0;
}

/* ============================================================================
 * Public API
 * ==========================================================================*/

/**
 * @function sortRulesByState
 * @description
 * Sorts atomic rules by state priority and structural fields.
 *
 * Structural rules:
 * - delegates all comparison logic to compareRules()
 * - sorting is stable and deterministic
 *
 * @param {AtomicRule[]} rules
 *   The list of rules to sort.
 *
 * @returns {AtomicRule[]}
 *   A new array sorted by state priority and structural metadata.
 */
export function sortRulesByState(rules: AtomicRule[]): AtomicRule[] {
  return [...rules].sort(compareRules);
}
