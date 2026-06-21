/**
 * @module simplify-engine/src/types/roles
 * @version 1.0.0
 *
 * @description
 * Complete set of WAI‑ARIA roles supported by SimplifyUI.
 *
 * These map directly to the `role` attribute on DOM elements.
 *
 * Roles are grouped by category:
 * - widget roles
 * - landmark roles
 * - document structure roles
 * - live region roles
 * - window roles
 * - graphics roles
 *
 * This union ensures:
 * - autocomplete for valid roles
 * - compile‑time validation
 * - no invalid or misspelled roles
 *
 * This module is intentionally dependency‑free.
 */

// ============================================================================
// WAI‑ARIA Roles
// ============================================================================

export type Role =
  // Widget roles
  | "button"
  | "checkbox"
  | "switch"
  | "radio"
  | "slider"
  | "spinbutton"
  | "textbox"
  | "searchbox"
  | "combobox"
  | "listbox"
  | "option"
  | "menu"
  | "menubar"
  | "menuitem"
  | "menuitemcheckbox"
  | "menuitemradio"
  | "progressbar"
  | "scrollbar"
  | "separator"
  | "tab"
  | "tablist"
  | "tabpanel"
  | "tree"
  | "treeitem"
  | "grid"
  | "gridcell"
  | "row"
  | "rowgroup"
  | "rowheader"
  | "columnheader"
  | "table"
  | "cell"
  | "link"
  | "img"
  | "alert"
  | "alertdialog"
  | "dialog"
  | "tooltip"
  | "status"
  | "timer"

  // Landmark roles
  | "banner"
  | "navigation"
  | "main"
  | "contentinfo"
  | "complementary"
  | "form"
  | "region"
  | "search"

  // Document structure roles
  | "article"
  | "document"
  | "heading"
  | "list"
  | "listitem"
  | "definition"
  | "term"
  | "note"
  | "presentation"
  | "none"

  // Live region roles
  | "log"
  | "marquee"

  // Window roles
  | "window"

  // Graphics roles (SVG / canvas)
  | "graphics-document"
  | "graphics-object"
  | "graphics-symbol";
