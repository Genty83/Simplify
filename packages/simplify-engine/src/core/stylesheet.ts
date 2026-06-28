/******************************************************************************
 * @module simplify-engine/src/core/utils/stylesheet
 * @version 2.0.0
 * @author
 *   SimplifyUI Engineering — Craig Gent
 *
 * @description
 * Public API for the Simplify runtime stylesheet engine.
 *
 * Responsibilities:
 * - manage the shared <style> tag
 * - parse raw CSS rules and register them into the stylesheet registry
 * - flush the registry into a deterministic stylesheet
 * - clear/reset stylesheet state
 * - wrap existing atomic rules into CSS layers
 *
 * Non‑Responsibilities:
 * - storing atomic rules (handled by registry.ts)
 * - sorting selectors or at‑rules
 * - resolving state priority
 * - generating atomic CSS
 *
 * Design Principles:
 * - minimal surface area
 * - delegates all logic to specialized modules
 * - deterministic and SSR‑safe
 ******************************************************************************/

import { getRule } from "./registry";
import {
  RULES,
  registerCSSRule,
} from "./utils/stylesheetRegistry"; // stylesheet registry
import { buildStylesheet } from "./utils/stylesheetEmitter";

const STYLE_TAG_ID = "Simplify";
const BASE_LAYER = "base";
const BASE_AT_RULE = "base";

/* ============================================================================
 * Style tag management
 * ==========================================================================*/

let styleTag: HTMLStyleElement | null = null;

/**
 * @function getStyleTag
 * @description
 * Returns the shared <style> tag, creating it on first use.
 */
export function getStyleTag(): HTMLStyleElement | null {
  if (typeof document === "undefined") return null;
  if (styleTag) return styleTag;

  const tag = document.createElement("style");
  tag.id = STYLE_TAG_ID;
  tag.appendChild(document.createTextNode(""));

  document.head.appendChild(tag);
  styleTag = tag;

  return tag;
}

/* ============================================================================
 * CSS parsing helpers
 * ==========================================================================*/

const SELECTOR_BODY_SPLIT = /\s*\{\s*|\s*\}\s*/;

function splitSelectorBody(rule: string): [string, string] {
  const p = rule.split(SELECTOR_BODY_SPLIT).filter(Boolean);
  return [(p[0] ?? "").trim(), (p[1] ?? "").trim()];
}

function parseBlock(rule: string) {
  const trimmed = rule.trim();
  const open = trimmed.indexOf("{");
  const close = trimmed.lastIndexOf("}");

  return {
    head: trimmed.slice(0, open).trim(),
    inner: trimmed.slice(open + 1, close).trim(),
  };
}

function parseMedia(rule: string) {
  const { head, inner } = parseBlock(rule);

  const open = head.indexOf("(");
  const close = head.indexOf(")");

  // Extract the raw condition inside parentheses
  const raw = head.slice(open + 1, close).trim();

  // Remove surrounding parentheses if present
  const cond =
    raw.startsWith("(") && raw.endsWith(")")
      ? raw.slice(1, -1).trim()
      : raw;

  return { cond, inner };
}


function classify(rule: string): "base" | "media" | "container" {
  const trimmed = rule.trim();
  if (trimmed.startsWith("@container")) return "container";
  if (trimmed.startsWith("@media")) return "media";
  return "base";
}

/* ============================================================================
 * Public API: rule injection
 * ==========================================================================*/

/**
 * @function injectCSS
 * @description
 * Parses a raw CSS rule and registers it into the stylesheet registry.
 */
export function injectCSS(css: string): void {
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

/* ============================================================================
 * Public API: flushing
 * ==========================================================================*/

/**
 * @function flushStylesheet
 * @description
 * Builds and injects the current stylesheet into the shared <style> tag.
 */
export function flushStylesheet(): void {
  const tag = getStyleTag();
  if (!tag) return;

  const css = buildStylesheet(RULES);
  const placeholder = tag.firstChild;

  tag.textContent = "";
  if (placeholder) tag.appendChild(placeholder);
  tag.appendChild(document.createTextNode(css));
}

/* ============================================================================
 * Public API: clearing/resetting
 * ==========================================================================*/

export function clearStylesheet(): void {
  for (const key of Object.keys(RULES)) {
    delete RULES[key];
  }

  const tag = getStyleTag();
  if (!tag) return;

  while (tag.childNodes.length > 1) {
    tag.removeChild(tag.lastChild!);
  }
}

export function resetStylesheet(): void {
  clearStylesheet();
}

/* ============================================================================
 * Public API: layering
 * ==========================================================================*/

/**
 * @function wrapInLayer
 * @description
 * Re-registers rules for a list of class names under a specific CSS layer.
 */
export function wrapInLayer(classNames: string, layer: string): string {
  for (const name of classNames.split(" ").filter(Boolean)) {
    const rule = getRule(name);
    if (!rule) continue;

    const trimmed = rule.trim();
    const kind = classify(trimmed);

    if (kind === "container") {
      const { head, inner } = parseBlock(trimmed);
      const [sel, body] = splitSelectorBody(inner);
      registerCSSRule(sel, body, head, layer);
      continue;
    }

    if (kind === "media") {
      const { cond, inner } = parseMedia(trimmed);
      const [sel, body] = splitSelectorBody(inner);
      registerCSSRule(sel, body, cond, layer);
      continue;
    }

    const [sel, body] = splitSelectorBody(trimmed);
    registerCSSRule(sel, body, BASE_AT_RULE, layer);
  }

  return classNames;
}

/* ============================================================================
 * Test‑only exports
 * ==========================================================================*/

export const __TESTING__ = {
  splitSelectorBody,
  parseBlock,
  parseMedia,
  classify,
  buildStylesheet,
  RULES,
};

