/******************************************************************************
 * @module simplify-engine/src/types/globals
 * @version 2.0.0
 * @author
 *   SimplifyUI Engineering — Craig Gent
 *
 * @description
 * Type contracts for the `globals` sheet-level utility.
 *
 * The globals utility allows sheets to define global CSS rules targeting
 * real selectors (e.g. "body", "a", "h1", ":root", "*").
 *
 * Each selector maps to one or more existing Simplify language utilities.
 * Global rules are expanded through the normal atomic compilation pipeline
 * but bypass component class generation.
 *
 * Responsibilities:
 * - Provide strongly typed selector keys
 * - Reuse all existing language utility types
 * - Provide IntelliSense for common HTML selectors
 * - Support arbitrary CSS selectors through template literal types
 *
 * Non-Responsibilities:
 * - CSS generation
 * - Registry management
 * - DOM interaction
 * - Runtime selector validation
 ******************************************************************************/

import type {
  SuiInteractionProps,
  SuiLayoutProps,
  SuiMotionProps,
  SuiShapeProps,
  SuiSizingProps,
  SuiSpacingProps,
  SuiSurfaceProps,
  SuiTypographyProps
} from "../language";

/* ============================================================================
 * HTML Elements
 * ==========================================================================*/

export type HtmlSelector =
  | "html"
  | "body"
  | "main"
  | "header"
  | "footer"
  | "nav"
  | "section"
  | "article"
  | "aside"
  | "div"
  | "span"
  | "p"
  | "strong"
  | "em"
  | "small"
  | "blockquote"
  | "pre"
  | "code"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "a"
  | "button"
  | "input"
  | "textarea"
  | "select"
  | "option"
  | "label"
  | "form"
  | "img"
  | "picture"
  | "svg"
  | "canvas"
  | "video"
  | "audio"
  | "table"
  | "thead"
  | "tbody"
  | "tfoot"
  | "tr"
  | "td"
  | "th"
  | "ul"
  | "ol"
  | "li";

/* ============================================================================
 * Global Selectors
 * ==========================================================================*/

export type GlobalSelector =
  | "*"
  | "*::before"
  | "*::after"
  | ":root";

/* ============================================================================
 * Selector Templates
 * ==========================================================================*/

export type ClassSelector = `.${string}`;

export type IdSelector = `#${string}`;

export type AttributeSelector = `[${string}]`;

export type PseudoClassSelector = `${HtmlSelector}:${string}`;

export type PseudoElementSelector = `${HtmlSelector}::${string}`;

export type ComplexSelector =
  | `${string} ${string}`
  | `${string}>${string}`
  | `${string}+${string}`
  | `${string}~${string}`;

/* ============================================================================
 * Supported Selector
 * ==========================================================================*/

export type SuiGlobalSelector =
  | HtmlSelector
  | GlobalSelector
  | ClassSelector
  | IdSelector
  | AttributeSelector
  | PseudoClassSelector
  | PseudoElementSelector
  | ComplexSelector;

/* ============================================================================
 * Selector Object
 * ==========================================================================*/

export interface GlobalsSelectorObject {
  layout?: SuiLayoutProps;
  surface?: SuiSurfaceProps;
  shape?: SuiShapeProps;
  motion?: SuiMotionProps;
  sizing?: SuiSizingProps;
  typography?: SuiTypographyProps;
  interaction?: SuiInteractionProps;
  spacing?: SuiSpacingProps;
}

/* ============================================================================
 * Globals Utility
 * ==========================================================================*/

/**
 * Maps CSS selectors to Simplify language utilities.
 *
 * Examples:
 *
 * {
 *   body: {
 *     surface: { background: "#111" }
 *   },
 *
 *   a:hover: {
 *     typography: { color: "#fff" }
 *   },
 *
 *   ".card": {
 *     spacing: { padding: 24 }
 *   },
 *
 *   "#app": {
 *     layout: { display: "flex" }
 *   }
 * }
 */
export type GlobalsUtility = {
  [Selector in SuiGlobalSelector]?: GlobalsSelectorObject;
} & {
  /**
   * Escape hatch for advanced selectors not represented by the built-in
   * selector types.
   */
  [selector: string]: GlobalsSelectorObject;
};