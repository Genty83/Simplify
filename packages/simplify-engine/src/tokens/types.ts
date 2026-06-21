/**
 * @module simplify-engine/src/tokens/types
 * @version 1.0.0
 *
 * @description
 * Core semantic token scale definitions for the Simplify engine.
 *
 * Simplify is built on eight UI design principles:
 * - layout
 * - surface
 * - shape
 * - motion
 * - sizing
 * - spacing
 * - typography
 * - interaction
 *
 * The tokens package mirrors these principles directly. Each principle has
 * its own semantic token scale, all based on a shared 5‑step size structure:
 *
 *   xsmall → small → medium → large → xlarge
 *
 * This file defines the *shape* of these scales. It does not contain any
 * actual values, branding, or theme logic. Higher‑level systems (such as
 * SimplifyUI) may extend these scales to create semantic roles, component
 * tokens, or themed variations.
 */

/* ============================================================================
 * Shared Semantic Scale
 * ==========================================================================*/

export interface SuiTokenSizeScale {
  xsmall: string;
  small: string;
  medium: string;
  large: string;
  xlarge: string;
}

/* ============================================================================
 * Layout Tokens
 * ==========================================================================*/

export interface SuiLayoutTokens {
  gap: SuiTokenSizeScale;
  inset: SuiTokenSizeScale;
  stack: SuiTokenSizeScale;
}

/* ============================================================================
 * Surface Tokens
 * ==========================================================================*/

export interface SuiSurfaceTokens {
  elevation: SuiTokenSizeScale;
  overlay: SuiTokenSizeScale;
}

/* ============================================================================
 * Shape Tokens
 * ==========================================================================*/

export interface SuiShapeTokens {
  radius: SuiTokenSizeScale;
  borderWidth: SuiTokenSizeScale;
}

/* ============================================================================
 * Motion Tokens
 * ==========================================================================*/

export interface SuiMotionTokens {
  duration: SuiTokenSizeScale;
  easing: SuiTokenSizeScale;
}

/* ============================================================================
 * Sizing Tokens
 * ==========================================================================*/

export interface SuiSizingTokens {
  size: SuiTokenSizeScale;
}

/* ============================================================================
 * Spacing Tokens
 * ==========================================================================*/

export interface SuiSpacingTokens {
  space: SuiTokenSizeScale;
}

/* ============================================================================
 * Typography Tokens
 * ==========================================================================*/

export interface SuiTypographyTokens {
  fontSize: SuiTokenSizeScale;
  lineHeight: SuiTokenSizeScale;
  letterSpacing: SuiTokenSizeScale;

  fontWeight: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };

  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
    display?: string;
  };
}

/* ============================================================================
 * Interaction Tokens
 * ==========================================================================*/

export interface SuiInteractionTokens {
  hitTarget: SuiTokenSizeScale;
  focusRing: SuiTokenSizeScale;
}

/* ============================================================================
 * Root Token Contract
 * ==========================================================================*/

/**
 * @description
 * The complete token contract for the Simplify engine.
 *
 * Every token set must implement this interface. The engine relies on this
 * structure to provide deterministic, rectangular access to all token
 * categories.
 *
 * SimplifyUI will extend this interface with:
 * - semantic roles
 * - component tokens
 * - theme variations
 * - color roles
 */
export interface SuiTokens {
  layout: SuiLayoutTokens;
  surface: SuiSurfaceTokens;
  shape: SuiShapeTokens;
  motion: SuiMotionTokens;
  sizing: SuiSizingTokens;
  spacing: SuiSpacingTokens;
  typography: SuiTypographyTokens;
  interaction: SuiInteractionTokens;
}

/**
 * @description
 * Deeply‑partial token override type used by `setTokens()`.
 *
 * This allows nested partial updates while preserving strict typing
 * for the full SuiTokens contract.
 */
export type SuiTokenOverrides = {
  [K in keyof SuiTokens]?: {
    [P in keyof SuiTokens[K]]?: Partial<SuiTokens[K][P]>;
  };
};
