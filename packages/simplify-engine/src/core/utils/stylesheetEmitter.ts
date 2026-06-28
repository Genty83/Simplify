/******************************************************************************
 * @module simplify-engine/src/core/utils/stylesheetEmitter
 * @version 1.0.0
 * @author Craig
 *
 * @description
 * Pure CSS emission utilities for the Simplify runtime stylesheet engine.
 *
 * Responsibilities:
 * - format selector/declaration blocks
 * - format at‑rule wrappers
 * - emit grouped selector blocks
 * - build the final stylesheet string from a registry
 *
 * Non‑Responsibilities:
 * - parsing CSS
 * - interacting with the DOM
 * - resolving selector states
 * - sorting selectors or at‑rules
 * - managing the rule registry
 *
 * Design Principles:
 * - pure and deterministic
 * - rectangular branching (no inference)
 * - stable, predictable output
 * - safe for SSR, workers, and edge runtimes
 ******************************************************************************/

import type { RuleRegistry } from "../../types";
import { compareSelectors } from "./selectorState";
import { compareAtRules } from "./atRuleSorting";

const BASE_LAYER = "base";
const BASE_AT_RULE = "base";
const INDENT = "  ";

/* ============================================================================
 * Rule emission
 * ==========================================================================*/

/**
 * @function emitRule
 * @description
 * Emits a single CSS selector/declaration block.
 *
 * Structural rules:
 * - indentation is controlled by caller
 * - no inference or formatting beyond fixed structure
 *
 * @param selector The CSS selector.
 * @param body The declaration body.
 * @param indent The indentation depth.
 * @returns A formatted CSS rule string.
 */
export function emitRule(
  selector: string,
  body: string,
  indent: number,
): string {
  return `${INDENT.repeat(indent)}${selector} { ${body} }\n`;
}

/* ============================================================================
 * At‑rule wrappers
 * ==========================================================================*/

/**
 * @function emitAtRuleOpen
 * @description
 * Emits the opening line for an at‑rule block.
 *
 * Structural rules:
 * - base at‑rules emit nothing
 * - container queries use their raw head
 * - media queries wrap the condition in @media (...)
 *
 * @param atRule The at‑rule key.
 * @returns The formatted opening line or an empty string.
 */
export function emitAtRuleOpen(atRule: string): string {
  if (atRule === BASE_AT_RULE) return "";

  const isContainer = atRule.startsWith("@container");
  const head = isContainer ? atRule : `@media (${atRule})`;

  return `${INDENT}${head} {\n`;
}

/**
 * @function emitAtRuleClose
 * @description
 * Emits the closing brace for an at‑rule block.
 *
 * Structural rules:
 * - base at‑rules emit nothing
 *
 * @param atRule The at‑rule key.
 * @returns A closing brace or an empty string.
 */
export function emitAtRuleClose(atRule: string): string {
  return atRule === BASE_AT_RULE ? "" : `${INDENT}}\n`;
}

/* ============================================================================
 * Selector group emission
 * ==========================================================================*/

/**
 * @function emitSelectorGroup
 * @description
 * Emits all selector rules for a given at‑rule/layer group.
 *
 * Structural rules:
 * - indentation depends on layer + at‑rule
 * - selectors are sorted externally via compareSelectors()
 *
 * @param selectors A map of selector → declaration body.
 * @param isBaseLayer Whether this is the base layer.
 * @param isBaseAtRule Whether this is the base at‑rule.
 * @returns A formatted block of CSS rules.
 */
export function emitSelectorGroup(
  selectors: Record<string, string>,
  isBaseLayer: boolean,
  isBaseAtRule: boolean,
): string {
  let output = "";
  const indent = isBaseLayer && isBaseAtRule ? 0 : isBaseAtRule ? 1 : 2;

  const keys = Object.keys(selectors).sort(compareSelectors);

  for (const selector of keys) {
    output += emitRule(selector, selectors[selector], indent);
  }

  return output;
}

/* ============================================================================
 * Stylesheet builder
 * ==========================================================================*/

/**
 * @function buildStylesheet
 * @description
 * Builds the final stylesheet string from the rule registry.
 *
 * Structural rules:
 * - layers sorted lexicographically
 * - at‑rules sorted via compareAtRules()
 * - selectors sorted via compareSelectors()
 * - no inference or mutation of registry
 *
 * @param registry The rule registry grouped by layer and at‑rule.
 * @returns A fully formatted CSS stylesheet string.
 */
export function buildStylesheet(registry: RuleRegistry): string {
  let output = "";

  const layers = Object.keys(registry).sort();

  for (const layer of layers) {
    const isBaseLayer = layer === BASE_LAYER;

    if (!isBaseLayer) {
      output += `@layer ${layer} {\n`;
    }

    const atRules = Object.keys(registry[layer]).sort(compareAtRules);

    for (const atRule of atRules) {
      const isBaseAtRule = atRule === BASE_AT_RULE;

      output += emitAtRuleOpen(atRule);
      output += emitSelectorGroup(
        registry[layer][atRule],
        isBaseLayer,
        isBaseAtRule,
      );
      output += emitAtRuleClose(atRule);
    }

    if (!isBaseLayer) {
      output += `}\n`;
    }
  }

  return output;
}

/* ============================================================================
 * Test‑only exports
 * ==========================================================================*/

export const __TESTING__ = {
  emitRule,
  emitAtRuleOpen,
  emitAtRuleClose,
  emitSelectorGroup,
  buildStylesheet,
};
