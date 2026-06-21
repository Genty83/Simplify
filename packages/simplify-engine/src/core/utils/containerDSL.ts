/******************************************************************************
 * @module simplify-engine/src/core/utils/containerDSL
 * @version 1.0.0
 * @description
 * Declarative DSL parsing + hashing utilities for the SimplifyUI container
 * query engine.
 *
 * Responsibilities:
 * - parse declarative DSL objects into CSS conditions
 * - generate stable hashed DSL keys
 * - maintain an internal DSL → condition registry
 * - resolve DSL keys back into parsed conditions
 *
 * Non‑Responsibilities:
 * - legacy syntax parsing (width:, height:, between:)
 * - condition building (minWidth, maxHeight, etc.)
 * - wrapping CSS blocks
 * - public container‑query API
 *
 * Design Principles:
 * - pure, deterministic, structural
 * - helpers under 15 lines
 * - no magic values
 ***************************************************************************** */

import type { ContainerQueryDSL, AnyContainerBreakpoint } from "../../types";
import {
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  orientation,
  joinConditions,
} from "./containerConditions";

/* ============================================================================
 * Constants
 * ==========================================================================*/

const PREFIX_DSL = "@containerDSL:";

const HASH_SEED = 0;
const HASH_MULTIPLIER = 31;

/* ============================================================================
 * Internal Registry
 * ==========================================================================*/

const containerDSLRegistry: Record<string, string> = Object.create(null);

/* ============================================================================
 * Error Helpers
 * ==========================================================================*/

/**
 * @function throwEmptyDSL
 * @description
 * Throws when a DSL object contains no valid condition fields.
 */
function throwEmptyDSL(): never {
  throw new Error(
    "Container DSL must specify at least one condition (minWidth, maxWidth, minHeight, maxHeight, or orientation)."
  );
}

/* ============================================================================
 * DSL Parsing
 * ==========================================================================*/

/**
 * @function parseContainerDSL
 * @description
 * Converts a declarative DSL object into a combined container condition.
 *
 * Structural rules:
 * - uses a strategy map (no branching)
 * - preserves input order via Object.keys
 * - throws if no fields are present
 *
 * @param dsl The DSL definition.
 * @returns A combined container condition string.
 */
export function parseContainerDSL(dsl: ContainerQueryDSL): string {
  const builders = {
    minWidth: (v: number) => minWidth(v),
    maxWidth: (v: number) => maxWidth(v),
    minHeight: (v: number) => minHeight(v),
    maxHeight: (v: number) => maxHeight(v),
    orientation: (v: "portrait" | "landscape") => orientation(v),
  } as const;

  const conditions: string[] = [];

  (Object.keys(builders) as Array<keyof typeof builders>).forEach((key) => {
    const value = dsl[key];
    if (value !== undefined) {
      conditions.push(builders[key](value as never));
    }
  });

  if (conditions.length === 0) throwEmptyDSL();
  return joinConditions(conditions);
}

/* ============================================================================
 * DSL Hashing
 * ==========================================================================*/

/**
 * @function hashContainerDSL
 * @description
 * Produces a stable, deterministic hash for a DSL object.
 *
 * Structural rules:
 * - sorts keys alphabetically
 * - serializes to JSON
 * - multiplies + shifts for deterministic hashing
 *
 * @param dsl The DSL definition.
 * @returns A hashed DSL key.
 */
export function hashContainerDSL(dsl: ContainerQueryDSL): string {
  const sorted = Object.keys(dsl)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      acc[key] = (dsl as Record<string, unknown>)[key];
      return acc;
    }, {});

  const serialized = JSON.stringify(sorted);

  let hash = HASH_SEED;
  for (let i = 0; i < serialized.length; i++) {
    hash = (hash * HASH_MULTIPLIER + serialized.charCodeAt(i)) >>> 0;
  }

  return `${PREFIX_DSL}${hash.toString(16)}`;
}

/* ============================================================================
 * DSL Resolution
 * ==========================================================================*/

/**
 * @function resolveContainerDSL
 * @description
 * Resolves a DSL‑based breakpoint key into its parsed CSS condition.
 *
 * @param key A container breakpoint key.
 * @returns The parsed condition, or `null` if not DSL‑based.
 */
export function resolveContainerDSL(
  key: AnyContainerBreakpoint,
): string | null {
  if (!key.startsWith(PREFIX_DSL)) return null;
  return containerDSLRegistry[key] ?? null;
}

/* ============================================================================
 * Public Factory: cq()
 * ==========================================================================*/

/**
 * @function cq
 * @description
 * Creates a stable container‑query breakpoint key from a DSL object.
 *
 * Structural rules:
 * - deterministic across environments
 * - independent of property order
 * - cached for reuse
 *
 * @param dsl The DSL definition.
 * @returns A hashed DSL breakpoint key.
 */
export function cq(dsl: ContainerQueryDSL): AnyContainerBreakpoint {
  const key = hashContainerDSL(dsl);

  if (!containerDSLRegistry[key]) {
    containerDSLRegistry[key] = parseContainerDSL(dsl);
  }

  return key as AnyContainerBreakpoint;
}
