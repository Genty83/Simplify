import { describe, it, expect, beforeEach } from "vitest";
import {
  RULES,
  ensureLayer,
  ensureAtRule,
  registerCSSRule,
} from "../../../core/utils/stylesheetRegistry";

describe("stylesheetRegistry", () => {
  beforeEach(() => {
    // Reset RULES without replacing the object reference
    for (const key of Object.keys(RULES)) {
      delete RULES[key];
    }
  });

  /* ==========================================================================
   * ensureLayer()
   * ======================================================================= */

  describe("ensureLayer()", () => {
    it("creates a new layer bucket when missing", () => {
      const layer = ensureLayer("theme");
      expect(layer).toEqual({});
      expect(RULES.theme).toBe(layer);
    });

    it("returns the existing layer bucket when present", () => {
      const first = ensureLayer("theme");
      const second = ensureLayer("theme");
      expect(first).toBe(second);
    });
  });

  /* ==========================================================================
   * ensureAtRule()
   * ======================================================================= */

  describe("ensureAtRule()", () => {
    it("creates a new at-rule bucket inside a layer", () => {
      const bucket = ensureAtRule("theme", "min-width: 640px");
      expect(bucket).toEqual({});
      expect(RULES.theme["min-width: 640px"]).toBe(bucket);
    });

    it("returns the existing at-rule bucket when present", () => {
      const first = ensureAtRule("theme", "min-width: 640px");
      const second = ensureAtRule("theme", "min-width: 640px");
      expect(first).toBe(second);
    });
  });

  /* ==========================================================================
   * registerCSSRule()
   * ======================================================================= */

  describe("registerCSSRule()", () => {
    it("registers a selector/body pair under the correct layer and at-rule", () => {
      registerCSSRule(".a", "color:red;", "min-width: 640px", "theme");

      expect(RULES.theme["min-width: 640px"][".a"]).toBe("color:red;");
    });

    it("overwrites existing selectors deterministically", () => {
      registerCSSRule(".a", "x:1;", "base", "theme");
      registerCSSRule(".a", "x:2;", "base", "theme");

      expect(RULES.theme.base[".a"]).toBe("x:2;");
    });

    it("defaults to base layer + base at-rule when omitted", () => {
      registerCSSRule(".a", "x:1;");

      expect(RULES.base.base[".a"]).toBe("x:1;");
    });
  });
});
