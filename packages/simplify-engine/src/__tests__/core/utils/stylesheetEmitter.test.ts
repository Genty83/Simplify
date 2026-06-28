import { describe, it, expect } from "vitest";
import {
  emitRule,
  emitAtRuleOpen,
  emitAtRuleClose,
  emitSelectorGroup,
  buildStylesheet,
} from "../../../core/utils/stylesheetEmitter";

describe("stylesheetEmitter", () => {
  /* ==========================================================================
   * emitRule()
   * ======================================================================= */

  describe("emitRule()", () => {
    it("emits a selector/declaration block with correct indentation", () => {
      const out = emitRule(".a", "color:red;", 0);
      expect(out).toBe(".a { color:red; }\n");
    });

    it("respects indentation depth", () => {
      const out = emitRule(".b", "x:1;", 2);
      expect(out).toBe("    .b { x:1; }\n"); // 4 spaces
    });
  });

  /* ==========================================================================
   * emitAtRuleOpen()
   * ======================================================================= */

  describe("emitAtRuleOpen()", () => {
    it("emits nothing for base at-rule", () => {
      expect(emitAtRuleOpen("base")).toBe("");
    });

    it("emits @media wrapper for media queries", () => {
      expect(emitAtRuleOpen("min-width: 640px"))
        .toBe("  @media (min-width: 640px) {\n");
    });

    it("emits raw container query head", () => {
      expect(emitAtRuleOpen("@container size"))
        .toBe("  @container size {\n");
    });
  });

  /* ==========================================================================
   * emitAtRuleClose()
   * ======================================================================= */

  describe("emitAtRuleClose()", () => {
    it("emits nothing for base at-rule", () => {
      expect(emitAtRuleClose("base")).toBe("");
    });

    it("emits closing brace for non-base at-rules", () => {
      expect(emitAtRuleClose("min-width: 640px")).toBe("  }\n");
    });
  });

  /* ==========================================================================
   * emitSelectorGroup()
   * ======================================================================= */

  describe("emitSelectorGroup()", () => {
    it("emits selectors sorted by compareSelectors()", () => {
      const selectors = {
        ".b:hover": "x:2;",
        ".a": "x:1;",
      };

      const out = emitSelectorGroup(selectors, true, true);

      const aIndex = out.indexOf(".a");
      const bIndex = out.indexOf(".b:hover");

      expect(aIndex).toBeLessThan(bIndex);
    });

    it("uses correct indentation for base layer + base at-rule", () => {
      const out = emitSelectorGroup({ ".a": "x:1;" }, true, true);
      expect(out).toBe(".a { x:1; }\n");
    });

    it("uses correct indentation for base layer + non-base at-rule", () => {
      const out = emitSelectorGroup({ ".a": "x:1;" }, true, false);
      expect(out).toBe("    .a { x:1; }\n"); // 4 spaces — correct engine behavior
    });

    it("uses correct indentation for non-base layer + non-base at-rule", () => {
      const out = emitSelectorGroup({ ".a": "x:1;" }, false, false);
      expect(out).toBe("    .a { x:1; }\n"); // also 4 spaces
    });
  });

  /* ==========================================================================
   * buildStylesheet()
   * ======================================================================= */

  describe("buildStylesheet()", () => {
    it("emits base layer rules without @layer wrapper", () => {
      const registry = {
        base: {
          base: {
            ".a": "x:1;",
          },
        },
      };

      const css = buildStylesheet(registry);

      expect(css).toContain(".a { x:1; }");
      expect(css).not.toContain("@layer");
    });

    it("wraps non-base layers in @layer blocks", () => {
      const registry = {
        base: { base: {} },
        theme: {
          base: {
            ".a": "x:1;",
          },
        },
      };

      const css = buildStylesheet(registry);

      expect(css).toContain("@layer theme");
      expect(css).toContain(".a { x:1; }");
    });

    it("emits media queries correctly", () => {
      const registry = {
        base: {
          "min-width: 640px": {
            ".b": "x:2;",
          },
        },
      };

      const css = buildStylesheet(registry);

      expect(css).toContain("@media (min-width: 640px)");
      expect(css).toContain(".b { x:2; }");
    });

    it("emits container queries correctly", () => {
      const registry = {
        base: {
          "@container size": {
            ".c": "x:3;",
          },
        },
      };

      const css = buildStylesheet(registry);

      expect(css).toContain("@container size");
      expect(css).toContain(".c { x:3; }");
    });

    it("sorts layers lexicographically", () => {
      const registry = {
        zeta: { base: {} },
        alpha: { base: {} },
      };

      const css = buildStylesheet(registry);

      const alphaIndex = css.indexOf("@layer alpha");
      const zetaIndex = css.indexOf("@layer zeta");

      expect(alphaIndex).toBeLessThan(zetaIndex);
    });
  });
});
