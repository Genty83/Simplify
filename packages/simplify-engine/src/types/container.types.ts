/**
 * @module simplify-engine/types/container
 * @version 1.0.0
 *
 * @description
 * Container‑query type contracts for the Simplify Engine.
 *
 * This module defines:
 * - Named container sizes
 * - Inline and range‑based container breakpoint syntaxes
 * - Unified `AnyContainerBreakpoint`
 * - `ContainerBreakpointGraph` for deterministic expansion
 * - `ContainerQueryDSL` — the semantic, declarative container‑query format
 *
 * These types are intentionally isolated and contain **no imports** to avoid
 * circular dependencies. They form the foundation of the container‑query
 * pipeline used by utilities, sheets, and the compiler.
 *
 * This file contains **no runtime logic** and is safe for static analysis.
 */

// ============================================================================
// Container Size Map
// ============================================================================

/**
 * @description
 * Map of named container sizes.
 *
 * Example:
 * ```ts
 * {
 *   small: "300px",
 *   medium: "600px"
 * }
 * ```
 */
export interface ContainerSizeMap {
  [name: string]: string;
}

/**
 * @description
 * A named container size.
 */
export type ContainerSize = string;

// ============================================================================
// Container Breakpoint Syntax
// ============================================================================

/**
 * @description
 * Inline container breakpoint syntax.
 *
 * Examples:
 * - `@container:width:300`
 * - `@container:height:500`
 */
export type InlineContainerBreakpoint =
  | `@container:width:${number}`
  | `@container:height:${number}`;

/**
 * @description
 * Between container breakpoint syntax.
 *
 * Example:
 * - `@container:between:300:900`
 */
export type BetweenContainerBreakpoint =
  `@container:between:${number}:${number}`;

/**
 * @description
 * Named container breakpoint syntax.
 *
 * Example:
 * - `@container:small`
 */
export type NamedContainerBreakpoint = `@container:${ContainerSize}`;

/**
 * @description
 * Any valid container breakpoint syntax.
 */
export type AnyContainerBreakpoint =
  | NamedContainerBreakpoint
  | InlineContainerBreakpoint
  | BetweenContainerBreakpoint;

/**
 * @description
 * Immutable list of container breakpoints.
 */
export type ContainerBreakpointGraph = readonly AnyContainerBreakpoint[];

// ============================================================================
// Container Query DSL
// ============================================================================

/**
 * @typedef ContainerQueryDSL
 * @description
 * Declarative, semantic container‑query definition used by the Simplify Engine.
 *
 * This DSL allows authors to express container conditions in a structured,
 * readable, and extensible way. It compiles into a valid CSS `@container`
 * condition string.
 *
 * Supported fields:
 * - `minWidth`     → (min-width: Xpx)
 * - `maxWidth`     → (max-width: Xpx)
 * - `minHeight`    → (min-height: Xpx)
 * - `maxHeight`    → (max-height: Xpx)
 * - `orientation`  → (orientation: portrait | landscape)
 *
 * At least one field must be provided.
 */
export interface ContainerQueryDSL {
  /** Minimum container width in pixels. */
  minWidth?: number;

  /** Maximum container width in pixels. */
  maxWidth?: number;

  /** Minimum container height in pixels. */
  minHeight?: number;

  /** Maximum container height in pixels. */
  maxHeight?: number;

  /** Container orientation constraint. */
  orientation?: "portrait" | "landscape";
}
