/**
 * @module simplify-engine/src/tokens/tokens
 * @version 1.0.0
 *
 * @description
 * Default token values for the Simplify engine.
 *
 * These values are intentionally:
 * - neutral
 * - minimal
 * - unopinionated
 * - design‑system agnostic
 *
 * They provide a functional baseline for the engine without imposing a
 * visual identity. SimplifyUI will build on top of these with semantic
 * roles, component tokens, and themed variations.
 */

import type {
  SuiTokens,
  SuiLayoutTokens,
  SuiSurfaceTokens,
  SuiShapeTokens,
  SuiMotionTokens,
  SuiSizingTokens,
  SuiSpacingTokens,
  SuiTypographyTokens,
  SuiInteractionTokens
} from "./types";

/* ============================================================================
 * Layout
 * ==========================================================================*/

const layout: SuiLayoutTokens = {
  gap: {
    xsmall: "2px",
    small: "4px",
    medium: "8px",
    large: "12px",
    xlarge: "16px"
  },
  inset: {
    xsmall: "2px",
    small: "4px",
    medium: "8px",
    large: "12px",
    xlarge: "16px"
  },
  stack: {
    xsmall: "2px",
    small: "4px",
    medium: "8px",
    large: "12px",
    xlarge: "16px"
  }
};

/* ============================================================================
 * Surface
 * ==========================================================================*/

const surface: SuiSurfaceTokens = {
  elevation: {
    xsmall: "1px",
    small: "2px",
    medium: "4px",
    large: "8px",
    xlarge: "12px"
  },
  overlay: {
    xsmall: "2%",
    small: "4%",
    medium: "6%",
    large: "8%",
    xlarge: "12%"
  }
};

/* ============================================================================
 * Shape
 * ==========================================================================*/

const shape: SuiShapeTokens = {
  radius: {
    xsmall: "2px",
    small: "4px",
    medium: "6px",
    large: "8px",
    xlarge: "12px"
  },
  borderWidth: {
    xsmall: "1px",
    small: "1px",
    medium: "2px",
    large: "2px",
    xlarge: "3px"
  }
};

/* ============================================================================
 * Motion
 * ==========================================================================*/

const motion: SuiMotionTokens = {
  duration: {
    xsmall: "50ms",
    small: "100ms",
    medium: "150ms",
    large: "200ms",
    xlarge: "300ms"
  },
  easing: {
    xsmall: "ease-in",
    small: "ease-out",
    medium: "ease-in-out",
    large: "cubic-bezier(0.4, 0, 0.2, 1)",
    xlarge: "cubic-bezier(0.2, 0, 0, 1)"
  }
};

/* ============================================================================
 * Sizing
 * ==========================================================================*/

const sizing: SuiSizingTokens = {
  size: {
    xsmall: "16px",
    small: "24px",
    medium: "32px",
    large: "40px",
    xlarge: "48px"
  }
};

/* ============================================================================
 * Spacing
 * ==========================================================================*/

const spacing: SuiSpacingTokens = {
  space: {
    xsmall: "2px",
    small: "4px",
    medium: "8px",
    large: "12px",
    xlarge: "16px"
  }
};

/* ============================================================================
 * Typography
 * ==========================================================================*/

const typography: SuiTypographyTokens = {
  fontSize: {
    xsmall: "10px",
    small: "12px",
    medium: "14px",
    large: "16px",
    xlarge: "20px"
  },
  lineHeight: {
    xsmall: "12px",
    small: "16px",
    medium: "20px",
    large: "24px",
    xlarge: "28px"
  },
  letterSpacing: {
    xsmall: "0px",
    small: "0px",
    medium: "0px",
    large: "0px",
    xlarge: "0px"
  },
  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  fontFamily: {
    sans: "system-ui, sans-serif",
    serif: "Georgia, serif",
    mono: "Menlo, monospace",
    display: "system-ui, sans-serif"
  }
};

/* ============================================================================
 * Interaction
 * ==========================================================================*/

const interaction: SuiInteractionTokens = {
  hitTarget: {
    xsmall: "24px",
    small: "28px",
    medium: "32px",
    large: "36px",
    xlarge: "40px"
  },
  focusRing: {
    xsmall: "1px",
    small: "2px",
    medium: "2px",
    large: "3px",
    xlarge: "3px"
  }
};

/* ============================================================================
 * Root Export
 * ==========================================================================*/

export const tokens: SuiTokens = {
  layout,
  surface,
  shape,
  motion,
  sizing,
  spacing,
  typography,
  interaction
};
