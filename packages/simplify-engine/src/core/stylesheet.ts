/*! *****************************************************************************
 * SimplifyUI Runtime Stylesheet Engine
 *
 * This module is the runtime output layer of the SimplifyUI atomic engine.
 * It maintains a single <style> tag, buffers atomic rules in a structured
 * registry, groups them by layer and at‑rule, and emits a minimal, stable,
 * human‑readable stylesheet. The module does not generate rules; it only
 * organizes, sorts, and writes them into the DOM in deterministic order.
 *
 * Designed for performance, predictability, and zero‑duplication output.
 * All rule generation, hashing, and normalization occur upstream.
 ***************************************************************************** */

import { getRule } from "./registry";

const STYLE_TAG_ID = "Simplify";
const BASE_LAYER = "base";
const BASE_AT_RULE = "base";
const SELECTOR_BODY_SPLIT = /\s*\{\s*|\s*\}\s*/;
const CONTAINER_AT_RULE = "@container";
const MEDIA_AT_RULE = "@media";
const INDENT = "  ";

type RuleRegistry = Record<string, Record<string, Record<string, string>>>;

let styleTag: HTMLStyleElement | null = null;
const RULES: RuleRegistry = Object.create(null);

/* Parsing */

/**
 * @description Splits a CSS rule into its selector and declaration body.
 * @param rule The full CSS rule string.
 * @returns A tuple containing `[selector, body]`.
 */
function splitSelectorBody(rule: string): [string, string] {
  const p = rule.split(SELECTOR_BODY_SPLIT).filter(Boolean);
  return [(p[0] ?? "").trim(), (p[1] ?? "").trim()];
}

/**
 * @description Extracts the outer head and inner content of a CSS block.
 * @param rule The full CSS rule string.
 * @returns An object containing `head` and `inner` segments.
 */
function parseBlock(rule: string) {
  const trimmed = rule.trim();
  const openBrace = trimmed.indexOf("{");
  const closeBrace = trimmed.lastIndexOf("}");

  const head = trimmed.slice(0, openBrace).trim();
  const inner = trimmed.slice(openBrace + 1, closeBrace).trim();

  return { head, inner };
}

/**
 * @description Parses a `@media` rule into its condition and inner content.
 * @param rule The full `@media` rule string.
 * @returns An object containing `cond` and `inner`.
 */
function parseMedia(rule: string) {
  const { head, inner } = parseBlock(rule);

  const openParen = head.indexOf("(");
  const closeParen = head.indexOf(")");

  const cond = head.slice(openParen + 1, closeParen).trim();

  return { cond, inner };
}

/**
 * @description Checks whether a rule is a `@media` block.
 * @param rule The CSS rule string.
 * @returns True if the rule starts with `@media`.
 */
function isMedia(rule: string) {
  const trimmed = rule.trim();
  return trimmed.startsWith(MEDIA_AT_RULE) && trimmed.endsWith("}");
}

/**
 * @description Checks whether a rule is a `@container` block.
 * @param rule The CSS rule string.
 * @returns True if the rule starts with `@container`.
 */
function isContainer(rule: string) {
  const trimmed = rule.trim();
  return trimmed.startsWith(CONTAINER_AT_RULE) && trimmed.endsWith("}");
}

/**
 * @description Determines whether a rule is base, media, or container.
 * @param rule The CSS rule string.
 * @returns One of `"base"`, `"media"`, or `"container"`.
 */
function classify(rule: string) {
  if (isContainer(rule)) return "container";
  if (isMedia(rule)) return "media";
  return "base";
}

/* Registry */

/**
 * @description Ensures a layer bucket exists in the rule registry.
 * @param layer The layer name to initialize.
 * @returns The layer bucket object.
 */
function ensureLayer(layer: string) {
  return (RULES[layer] ??= Object.create(null));
}

/**
 * @description Ensures an at‑rule bucket exists within a layer.
 * @param layer The layer name.
 * @param at The at‑rule key (e.g., "base", "min-width: 640px").
 * @returns The at‑rule bucket object.
 */
function ensureAtRule(layer: string, at: string) {
  return (ensureLayer(layer)[at] ??= Object.create(null));
}

/**
 * @description Registers a selector/body pair under a specific layer and at‑rule.
 * @param sel The CSS selector (e.g., ".sui‑abc123").
 * @param body The CSS declaration body.
 * @param at The at‑rule key (e.g., "base", "min-width: 640px").
 * @param layer The layer name to register under.
 */
export function registerCSSRule(
  sel: string,
  body: string,
  at = BASE_AT_RULE,
  layer = BASE_LAYER,
) {
  ensureAtRule(layer || BASE_LAYER, at || BASE_AT_RULE)[sel] = body;
}

/* Style tag */

/**
 * @description Returns the shared <style> tag, creating it on first use.
 * @returns The managed HTMLStyleElement, or null in non‑DOM environments.
 */
export function getStyleTag() {
  if (typeof document === "undefined") return null;
  if (styleTag) return styleTag;

  const tag = document.createElement("style");
  tag.id = STYLE_TAG_ID;
  tag.appendChild(document.createTextNode(""));

  document.head.appendChild(tag);
  styleTag = tag;

  return tag;
}

/* Sorting */

/**
 * @description Extracts the numeric min-width value from an at‑rule.
 * @param rule The at‑rule string to inspect.
 * @returns The extracted pixel value, or MAX_SAFE_INTEGER if none is found.
 */
function extractMin(rule: string) {
  const match = rule.match(/min-width:\s*(\d+)px/);
  return match ? parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

function sortAtRules(a: string, b: string) {
  if (a === BASE_AT_RULE) return -1;
  if (b === BASE_AT_RULE) return 1;
  const ac = a.startsWith(CONTAINER_AT_RULE);
  const bc = b.startsWith(CONTAINER_AT_RULE);
  if (ac !== bc) return ac ? 1 : -1;
  return extractMin(a) - extractMin(b);
}

/* Stylesheet building */

/**
 * @description Emits a single CSS selector/declaration block.
 * @param sel The CSS selector.
 * @param body The declaration body.
 * @param indent The indentation depth.
 * @returns A formatted CSS rule string.
 */
function emitRule(sel: string, body: string, indent: number) {
  return `${INDENT.repeat(indent)}${sel} { ${body} }\n`;
}

/**
 * @description Emits the opening line for an at‑rule block.
 * @param at The at‑rule key (e.g., "base", "min-width: 640px").
 * @returns The formatted opening line, or an empty string for base rules.
 */
function emitAtRuleOpen(at: string) {
  if (at === BASE_AT_RULE) return "";

  const head = at.startsWith(CONTAINER_AT_RULE)
    ? at
    : `${MEDIA_AT_RULE} (${at})`;

  return `${INDENT}${head} {\n`;
}

/**
 * @description Emits the closing brace for an at‑rule block.
 * @param at The at‑rule key.
 * @returns A closing brace, or an empty string for base rules.
 */
function emitAtRuleClose(at: string) {
  return at === BASE_AT_RULE ? "" : `${INDENT}}\n`;
}

/**
 * @description Emits all selector rules for a given at‑rule/layer group.
 * @param selectors A map of selector → declaration body.
 * @param baseLayer Whether this is the base layer.
 * @param baseAt Whether this is the base at‑rule.
 * @returns A formatted block of CSS rules.
 */
function emitSelectorGroup(
  selectors: Record<string, string>,
  baseLayer: boolean,
  baseAt: boolean,
) {
  let output = "";
  const indentLevel = baseLayer && baseAt ? 0 : baseAt ? 1 : 2;

  for (const selector of Object.keys(selectors).sort()) {
    output += emitRule(selector, selectors[selector], indentLevel);
  }

  return output;
}

/**
 * @description Builds the final stylesheet string from the rule registry.
 * @param reg The rule registry grouped by layer and at‑rule.
 * @returns A formatted CSS stylesheet.
 */
function buildStylesheet(reg: RuleRegistry) {
  let output = "";

  for (const layer of Object.keys(reg).sort()) {
    const isBaseLayer = layer === BASE_LAYER;

    if (!isBaseLayer) output += `@layer ${layer} {\n`;
    const atRuleGroups = reg[layer];

    for (const atRule of Object.keys(atRuleGroups).sort(sortAtRules)) {
      const isBaseAtRule = atRule === BASE_AT_RULE;

      output += emitAtRuleOpen(atRule);
      output += emitSelectorGroup(
        atRuleGroups[atRule],
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

/* Flush */

/**
 * @description Builds and injects the current stylesheet into the shared <style> tag.
 * @returns void
 */
export function flushStylesheet() {
  const tag = getStyleTag();
  if (!tag) return;

  const css = buildStylesheet(RULES);
  const placeholder = tag.firstChild;

  tag.textContent = "";
  if (placeholder) tag.appendChild(placeholder);
  tag.appendChild(document.createTextNode(css));
}

/* Public API */

/**
 * @description Parses a raw CSS rule and registers it into the rule registry.
 * @param css A single CSS rule string.
 * @returns void
 */
export function injectCSS(css: string) {
  const trimmed = css.trim();
  const kind = classify(trimmed);

  if (kind === "container") {
    const { head, inner } = parseBlock(trimmed);
    const [sel, body] = splitSelectorBody(inner);
    registerCSSRule(sel, body, head, BASE_LAYER);
    return;
  }

  if (kind === "media") {
    const { cond, inner } = parseMedia(trimmed);
    const [sel, body] = splitSelectorBody(inner);
    registerCSSRule(sel, body, cond, BASE_LAYER);
    return;
  }

  const [sel, body] = splitSelectorBody(trimmed);
  registerCSSRule(sel, body, BASE_AT_RULE, BASE_LAYER);
}

/**
 * @description Clears all registered rules and removes injected CSS from the <style> tag.
 * @returns void
 */
export function clearStylesheet() {
  for (const key of Object.keys(RULES)) delete RULES[key];

  const tag = getStyleTag();
  if (!tag) return;

  while (tag.childNodes.length > 1) {
    tag.removeChild(tag.lastChild!);
  }
}

/**
 * @description Alias for clearStylesheet().
 * @returns void
 */
export function resetStylesheet() {
  clearStylesheet();
}

/**
 * @description Parses a CSS rule and registers it under the given layer.
 * @param rule The CSS rule string.
 * @param layer The target layer name.
 * @returns void
 */
function parseAndRegister(rule: string, layer: string) {
  const trimmed = rule.trim();
  const kind = classify(trimmed);

  if (kind === "container") {
    const { head, inner } = parseBlock(trimmed);
    const [sel, body] = splitSelectorBody(inner);
    registerCSSRule(sel, body, head, layer);
    return;
  }

  if (kind === "media") {
    const { cond, inner } = parseMedia(trimmed);
    const [sel, body] = splitSelectorBody(inner);
    registerCSSRule(sel, body, cond, layer);
    return;
  }

  const [sel, body] = splitSelectorBody(trimmed);
  registerCSSRule(sel, body, BASE_AT_RULE, layer);
}

/**
 * @description Wraps a list of class names in a CSS layer by re‑registering their rules.
 * @param classNames Space‑separated class names.
 * @param layer The layer to assign the rules to.
 * @returns The original classNames string.
 */
export function wrapInLayer(classNames: string, layer: string) {
  for (const name of classNames.split(" ").filter(Boolean)) {
    const rule = getRule(name);
    if (rule) parseAndRegister(rule, layer);
  }

  return classNames;
}

// ============================================================================
// TEST-ONLY EXPORTS
// ============================================================================
export const __TESTING__ = {
  RULES,
  buildStylesheet,
};
