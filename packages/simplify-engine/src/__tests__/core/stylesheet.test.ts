import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../../core/stylesheet", async () => {
  const actual = await vi.importActual<any>("../../core/stylesheet");
  return {
    ...actual,
    getStyleTag: () => null,
  };
});

import * as sheet from "../../core/stylesheet";

const testing = (sheet as any).__TESTING__ as {
  RULES: Record<string, any>;
  buildStylesheet: (reg: Record<string, any>) => string;
};

const build = () => testing.buildStylesheet(testing.RULES);

describe("runtime stylesheet engine (DOM-free)", () => {
  beforeEach(() => {
    sheet.clearStylesheet();
  });

  /* ==========================================================================
   * injectCSS()
   * ======================================================================= */

  describe("injectCSS()", () => {
    it("registers a base rule", () => {
      sheet.injectCSS(".a { color:red }");

      const css = build();
      expect(css).toContain(".a { color:red }");
    });

    it("registers a @media rule", () => {
      sheet.injectCSS("@media (min-width: 640px) { .b { color:blue } }");

      const css = build();
      expect(css).toContain("@media (min-width: 640px)");
      expect(css).toContain(".b { color:blue }");
    });

    it("registers a @container rule", () => {
      sheet.injectCSS("@container (min-width: 500px) { .c { padding:10px } }");

      const css = build();
      expect(css).toContain("@container (min-width: 500px)");
      expect(css).toContain(".c { padding:10px }");
    });
  });

  /* ==========================================================================
   * at-rule sorting
   * ======================================================================= */

  describe("at-rule sorting", () => {
    it("sorts base → media → container by min-width", () => {
      sheet.injectCSS(".a { x:1 }");
      sheet.injectCSS("@media (min-width: 200px) { .b { x:2 } }");
      sheet.injectCSS("@media (min-width: 100px) { .c { x:3 } }");
      sheet.injectCSS("@container (min-width: 300px) { .d { x:4 } }");

      const css = build();

      const order = [
        css.indexOf(".a"),
        css.indexOf("(min-width: 100px)"),
        css.indexOf("(min-width: 200px)"),
        css.indexOf("@container"),
      ];

      expect(order).toEqual([...order].sort((a, b) => a - b));
    });
  });

  /* ==========================================================================
   * wrapInLayer()
   * ======================================================================= */

  describe("wrapInLayer()", () => {
    it("re-registers rules under a new layer but does not emit a layer wrapper for base-only rules", () =>  {
      sheet.injectCSS(".a { color:red }");

      sheet.wrapInLayer(".a", "theme");

      const css = build();

      expect(css).not.toContain("@layer theme");
      expect(css).toContain(".a { color:red }");
    });

    it("ignores class names with no registered rule", () => {
      sheet.injectCSS(".a { x:1 }");

      sheet.wrapInLayer(".missing .a", "theme");

      const css = build();

      expect(css).toContain(".a { x:1 }");
      expect(css).not.toContain("missing");
    });
  });

  /* ==========================================================================
   * clear/reset
   * ======================================================================= */

  describe("clearStylesheet() / resetStylesheet()", () => {
    it("clears all registered rules", () => {
      sheet.injectCSS(".a { x:1 }");
      sheet.injectCSS(".b { x:2 }");

      sheet.clearStylesheet();

      const css = build();
      expect(css).toBe("");
    });

    it("resetStylesheet() is an alias", () => {
      sheet.injectCSS(".a { x:1 }");

      sheet.resetStylesheet();

      const css = build();
      expect(css).toBe("");
    });
  });

  /* ==========================================================================
   * flushStylesheet()
   * ======================================================================= */

  describe("flushStylesheet()", () => {
    it("does nothing when getStyleTag() returns null", () => {
      sheet.injectCSS(".a { x:1 }");

      expect(() => sheet.flushStylesheet()).not.toThrow();
    });
  });
});
