/******************************************************************************
 * @module simplify-engine/src/services/cq
 * @version 1.0.0
 * @description
 * Public container‑query services for the SimplifyUI engine.
 *
 * Responsibilities:
 * - detect container breakpoint keys
 * - strip container prefixes
 * - resolve DSL keys via registry
 * - resolve legacy syntaxes via ordered parser list
 * - unify container‑query parsing
 * - wrap CSS blocks in @container rules
 * - map tuples to container size maps
 *
 * Non‑Responsibilities:
 * - DSL parsing or hashing (delegated to containerDSL)
 * - legacy syntax parsing (delegated to containerLegacy)
 * - condition building (delegated to containerConditions)
 *
 * Design Principles:
 * - pure and deterministic
 * - rectangular branching
 * - helpers under 15 lines
 * - no magic values
 ***************************************************************************** */

import type {
  AnyContainerBreakpoint,
  ContainerSizeMap,
} from "../types";

import { containerSizeMap } from "../config";

import { resolveContainerDSL } from "../core/utils/containerDSL";
import { LEGACY_PARSERS } from "../core/utils/containerLegacy";

/* ============================================================================
 * Constants
 * ==========================================================================*/

const PREFIX_CONTAINER = "@container";
const PREFIX_DSL = "@containerDSL:";

/* ============================================================================
 * Error Helpers
 * ==========================================================================*/

/**
 * @function throwInvalidSyntax
 * @description
 * Throws a standardized error for invalid container‑query syntax.
 */
function throwInvalidSyntax(key: string): never {
  throw new Error(
    `Invalid container query syntax: "${key}". Expected a named size, inline width/height, between range, or a DSL key created via cq().`
  );
}

/* ============================================================================
 * Breakpoint Detection
 * ==========================================================================*/

/**
 * @function isContainerBreakpoint
 * @description
 * Determines whether a string is a valid container‑query breakpoint key.
 *
 * @param key The string to test.
 * @returns True if the key begins with @container or @containerDSL.
 */
export function isContainerBreakpoint(
  key: string,
): key is AnyContainerBreakpoint {
  return key.startsWith(PREFIX_CONTAINER) || key.startsWith(PREFIX_DSL);
}

/* ============================================================================
 * Prefix Stripping
 * ==========================================================================*/

/**
 * @function stripPrefix
 * @description
 * Removes the @container prefix (with or without trailing colon).
 *
 * @param key A container breakpoint key.
 * @returns The raw portion of the key after the prefix.
 */
export function stripPrefix(key: string): string {
  const withColon = `${PREFIX_CONTAINER}:`;
  if (key.startsWith(withColon)) return key.slice(withColon.length);
  if (key.startsWith(PREFIX_CONTAINER)) return key.slice(PREFIX_CONTAINER.length);
  return key;
}

/* ============================================================================
 * Unified Container Query Parsing
 * ==========================================================================*/

/**
 * @function parseContainerQuery
 * @description
 * Parses a container breakpoint key into a full @container rule.
 *
 * Resolution order:
 * 1. DSL keys (via resolveContainerDSL)
 * 2. Legacy syntaxes (via LEGACY_PARSERS)
 * 3. Throws if no syntax matches
 *
 * @param key A container breakpoint key.
 * @param sizes The container size map for named sizes.
 * @returns A complete @container rule string.
 */
export function parseContainerQuery(
  key: AnyContainerBreakpoint,
  sizes: ContainerSizeMap = containerSizeMap,
): string {
  const dsl = resolveContainerDSL(key);
  if (dsl) return `@container ${dsl}`;

  const raw = stripPrefix(key).toLowerCase();

  for (const parser of LEGACY_PARSERS) {
    const result = parser(raw, sizes);
    if (result) return result;
  }

  throwInvalidSyntax(key);
}

/* ============================================================================
 * CSS Wrapping
 * ==========================================================================*/

/**
 * @function wrapInContainer
 * @description
 * Wraps a CSS block inside a @container rule.
 *
 * @param condition The container condition.
 * @param css The CSS block.
 * @returns A wrapped @container rule.
 */
export function wrapInContainer(condition: string, css: string): string {
  return `@container ${condition} { ${css} }`;
}

/* ============================================================================
 * Tuple → Container Size Map
 * ==========================================================================*/

/**
 * @function mapTupleToContainerSizes
 * @description
 * Maps a tuple of values to named container size keys.
 *
 * Structural rules:
 * - assigns tuple[i] → sizeKeys[i]
 * - first size key becomes default when present
 *
 * @param tuple The ordered list of values.
 * @param sizeKeys The ordered container size names.
 * @returns A size‑keyed record with optional default.
 */
export function mapTupleToContainerSizes<T>(
  tuple: readonly T[],
  sizeKeys: readonly string[],
): Partial<Record<string, T>> {
  const out: Partial<Record<string, T>> = {};

  sizeKeys.forEach((key, i) => {
    const v = tuple[i];
    if (v !== undefined) out[key] = v;
  });

  const first = sizeKeys[0];
  if (first && out[first] !== undefined) {
    out.default = out[first];
  }

  return out;
}
