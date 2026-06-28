import { describe, it, expect } from "vitest";
import {
  extractMinWidth,
  compareAtRules,
  __TESTING__,
} from "../../../core/utils/atRuleSorting";

describe("atRuleSorting", () => {
  /* ==========================================================================
   * extractMinWidth()
   * ======================================================================= */

  describe("extractMinWidth()", () => {
    it("extracts numeric min-width values", () => {
      expect(extractMinWidth("min-width: 640px")).toBe(640);
      expect(extractMinWidth("min-width: 0px")).toBe(0);
      expect(extractMinWidth("min-width: 1024px")).toBe(1024);
    });

    it("returns MAX_SAFE_INTEGER when no min-width is present", () => {
      expect(extractMinWidth("color:red")).toBe(Number.MAX_SAFE_INTEGER);
      expect(extractMinWidth("@container size")).toBe(Number.MAX_SAFE_INTEGER);
      expect(extractMinWidth("")).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  /* ==========================================================================
   * compareAtRules()
   * ======================================================================= */

  describe("compareAtRules()", () => {
    it("sorts base first", () => {
      expect(compareAtRules("base", "min-width: 640px")).toBeLessThan(0);
      expect(compareAtRules("min-width: 640px", "base")).toBeGreaterThan(0);
    });

    it("sorts container queries before media queries", () => {
      expect(compareAtRules("@container size", "min-width: 640px")).toBeLessThan(0);
      expect(compareAtRules("min-width: 640px", "@container size")).toBeGreaterThan(0);
    });

    it("sorts media queries by min-width ascending", () => {
      const rules = [
        "min-width: 1024px",
        "min-width: 640px",
        "min-width: 320px",
      ];

      const sorted = [...rules].sort(compareAtRules);

      expect(sorted).toEqual([
        "min-width: 320px",
        "min-width: 640px",
        "min-width: 1024px",
      ]);
    });

    it("treats unknown at-rules as MAX_SAFE_INTEGER", () => {
      const rules = [
        "min-width: 640px",
        "unknown-rule",
      ];

      const sorted = [...rules].sort(compareAtRules);

      expect(sorted[0]).toBe("min-width: 640px");
      expect(sorted[1]).toBe("unknown-rule");
    });
  });
});
