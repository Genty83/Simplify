import { describe, it, expect } from "vitest";

import {
  normalizePx,
  condition,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  orientation,
  joinConditions,
} from "../../../core/utils/containerConditions";

describe("core/utils/containerConditions", () => {
  /* ==========================================================================
   * normalizePx
   * ======================================================================= */

  describe("normalizePx()", () => {
    it("normalizes numbers to px", () => {
      expect(normalizePx(10)).toBe("10px");
      expect(normalizePx(0)).toBe("0px");
    });

    it("preserves strings ending in px", () => {
      expect(normalizePx("20px")).toBe("20px");
    });

    it("adds px to numeric strings", () => {
      expect(normalizePx("300")).toBe("300px");
    });

    it("preserves non-numeric strings", () => {
      expect(normalizePx("auto")).toBe("auto");
      expect(normalizePx("50%")).toBe("50%");
    });
  });

  /* ==========================================================================
   * condition()
   * ======================================================================= */

  describe("condition()", () => {
    it("builds a parenthesized condition", () => {
      expect(condition("min-width", 300)).toBe("(min-width: 300px)");
      expect(condition("max-height", "50px")).toBe("(max-height: 50px)");
    });
  });

  /* ==========================================================================
   * min/max width/height
   * ======================================================================= */

  describe("width/height condition builders", () => {
    it("minWidth()", () => {
      expect(minWidth(500)).toBe("(min-width: 500px)");
    });

    it("maxWidth()", () => {
      expect(maxWidth("800")).toBe("(max-width: 800px)");
    });

    it("minHeight()", () => {
      expect(minHeight(200)).toBe("(min-height: 200px)");
    });

    it("maxHeight()", () => {
      expect(maxHeight("300px")).toBe("(max-height: 300px)");
    });
  });

  /* ==========================================================================
   * orientation()
   * ======================================================================= */

  describe("orientation()", () => {
    it("creates orientation conditions", () => {
      expect(orientation("portrait")).toBe("(orientation: portrait)");
      expect(orientation("landscape")).toBe("(orientation: landscape)");
    });
  });

  /* ==========================================================================
   * joinConditions()
   * ======================================================================= */

  describe("joinConditions()", () => {
    it("joins conditions with logical AND", () => {
      const input = [
        "(min-width: 300px)",
        "(orientation: portrait)",
        "(max-height: 800px)",
      ];

      expect(joinConditions(input)).toBe(
        "(min-width: 300px) and (orientation: portrait) and (max-height: 800px)",
      );
    });

    it("preserves input order", () => {
      const input = ["A", "B", "C"];
      expect(joinConditions(input)).toBe("A and B and C");
    });

    it("handles single-element arrays", () => {
      expect(joinConditions(["A"])).toBe("A");
    });

    it("handles empty arrays", () => {
      expect(joinConditions([])).toBe("");
    });
  });
});
