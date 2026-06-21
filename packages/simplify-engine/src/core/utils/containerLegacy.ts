/******************************************************************************
 * @module simplify-engine/src/core/utils/containerLegacy
 * @version 1.0.0
 * @description
 * Legacy container‑query syntax parsers for SimplifyUI.
 *
 * Responsibilities:
 * - parse named container sizes
 * - parse inline width/height conditions
 * - parse between‑range conditions
 * - expose an ordered parser list for resolution
 *
 * Non‑Responsibilities:
 * - DSL parsing or hashing
 * - condition building (delegated to containerConditions)
 * - public container‑query API
 *
 * Design Principles:
 * - pure and deterministic
 * - rectangular branching
 * - helpers under 15 lines
 * - no magic values
 ***************************************************************************** */

import type { ContainerSizeMap } from "../../types";
import {
  minWidth,
  minHeight,
  maxWidth,
  joinConditions,
} from "./containerConditions";

/* ============================================================================
 * Constants
 * ==========================================================================*/

const PREFIX_WIDTH = "width:";
const PREFIX_HEIGHT = "height:";
const PREFIX_BETWEEN = "between:";

/* ============================================================================
 * Named Size Parser
 * ==========================================================================*/

/**
 * @function parseNamedSize
 * @description
 * Parses a named container size (e.g. "small") into a min‑width condition.
 *
 * @param rawKey The normalized container key.
 * @param sizes The container size map.
 * @returns A full `@container` rule, or `null` if not a named size.
 */
export function parseNamedSize(
  rawKey: string,
  sizes: ContainerSizeMap,
): string | null {
  if (!(rawKey in sizes)) return null;
  return `@container ${minWidth(sizes[rawKey])}`;
}

/* ============================================================================
 * Inline Width Parser
 * ==========================================================================*/

/**
 * @function parseInlineWidth
 * @description
 * Parses an inline width condition (e.g. "width:600").
 *
 * @param rawKey The normalized container key.
 * @returns A full `@container` rule, or `null` if not inline width.
 */
export function parseInlineWidth(rawKey: string): string | null {
  if (!rawKey.startsWith(PREFIX_WIDTH)) return null;
  const px = rawKey.slice(PREFIX_WIDTH.length);
  return `@container ${minWidth(px)}`;
}

/* ============================================================================
 * Inline Height Parser
 * ==========================================================================*/

/**
 * @function parseInlineHeight
 * @description
 * Parses an inline height condition (e.g. "height:400").
 *
 * @param rawKey The normalized container key.
 * @returns A full `@container` rule, or `null` if not inline height.
 */
export function parseInlineHeight(rawKey: string): string | null {
  if (!rawKey.startsWith(PREFIX_HEIGHT)) return null;
  const px = rawKey.slice(PREFIX_HEIGHT.length);
  return `@container ${minHeight(px)}`;
}

/* ============================================================================
 * Between‑Range Parser
 * ==========================================================================*/

/**
 * @function parseBetweenRange
 * @description
 * Parses a between‑range condition (e.g. "between:600:900").
 *
 * @param rawKey The normalized container key.
 * @returns A full `@container` rule, or `null` if not a between range.
 */
export function parseBetweenRange(rawKey: string): string | null {
  if (!rawKey.startsWith(PREFIX_BETWEEN)) return null;

  const [, min, max] = rawKey.split(":");
  const condition = joinConditions([minWidth(min), maxWidth(max)]);

  return `@container ${condition}`;
}

/* ============================================================================
 * Ordered Parser List
 * ==========================================================================*/

/**
 * @constant LEGACY_PARSERS
 * @description
 * Ordered list of legacy container‑syntax parsers.
 *
 * Resolution strategy:
 * - first parser returning non‑null wins
 */
export const LEGACY_PARSERS = [
  parseNamedSize,
  parseInlineWidth,
  parseInlineHeight,
  parseBetweenRange,
] as const;
