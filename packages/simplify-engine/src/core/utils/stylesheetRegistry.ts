/******************************************************************************
 * @module simplify-engine/src/core/utils/stylesheetRegistry
 * @version 1.0.0
 * @author Craig
 *
 * @description
 * Internal registry for the runtime stylesheet engine.
 *
 * Responsibilities:
 * - store selector → declaration rules grouped by layer and at‑rule
 * - preserve deterministic insertion order
 * - provide minimal APIs for stylesheetEmitter and stylesheet
 *
 * Non‑Responsibilities:
 * - hashing or deduplication
 * - storing atomic rules
 * - interacting with the DOM
 *
 * Design Principles:
 * - pure and synchronous
 * - rectangular branching (no inference)
 * - deterministic ordering via object key ordering
 ******************************************************************************/

import type { RuleRegistry } from "../../types/registry.types";

export const RULES: RuleRegistry = Object.create(null);

const BASE_LAYER = "base";
const BASE_AT_RULE = "base";

/* ============================================================================
 * Layer helpers
 * ==========================================================================*/

/**
 * @internal
 * Ensures a layer bucket exists.
 */
export function ensureLayer(layer: string) {
  return (RULES[layer] ??= Object.create(null));
}

/**
 * @internal
 * Ensures an at‑rule bucket exists within a layer.
 */
export function ensureAtRule(layer: string, atRule: string) {
  return (ensureLayer(layer)[atRule] ??= Object.create(null));
}

/* ============================================================================
 * Registration
 * ==========================================================================*/

/**
 * @function registerCSSRule
 * @description
 * Registers a selector/declaration pair under a layer + at‑rule.
 *
 * Structural rules:
 * - overwrites existing selectors
 * - no sorting or inference
 */
export function registerCSSRule(
  selector: string,
  body: string,
  atRule: string = BASE_AT_RULE,
  layer: string = BASE_LAYER,
): void {
  ensureAtRule(layer, atRule)[selector] = body;
}
