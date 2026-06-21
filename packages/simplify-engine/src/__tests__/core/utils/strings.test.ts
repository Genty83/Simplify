import { describe, it, expect } from "vitest";

import { toKebab, normalize } from "../../../core/utils/strings";

describe("core/utils/strings", () => {
  /* ==========================================================================
   * toKebab
   * ======================================================================= */

  describe("toKebab()", () => {
    it("converts camelCase to kebab-case", () => {
      expect(toKebab("backgroundColor")).toBe("background-color");
      expect(toKebab("marginTop")).toBe("margin-top");
    });

    it("converts PascalCase to kebab-case (leading hyphen allowed)", () => {
      expect(toKebab("BorderRadius")).toBe("-border-radius");
    });

    it("inserts hyphens before every uppercase letter", () => {
      expect(toKebab("WebkitTransitionDuration")).toBe(
        "-webkit-transition-duration",
      );
    });

    it("returns the same string when no uppercase letters exist", () => {
      expect(toKebab("opacity")).toBe("opacity");
      expect(toKebab("flex-grow")).toBe("flex-grow");
    });
  });

  /* ==========================================================================
   * normalize
   * ======================================================================= */

  describe("normalize()", () => {
    it("converts numbers to pixel strings", () => {
      expect(normalize(12)).toBe("12px");
      expect(normalize(0)).toBe("0px");
    });

    it("returns strings unchanged", () => {
      expect(normalize("2rem")).toBe("2rem");
      expect(normalize("auto")).toBe("auto");
    });

    it("throws for non-string and non-number values", () => {
      expect(() => normalize(null as any)).toThrow(
        /expected a string or number/,
      );
      expect(() => normalize(undefined as any)).toThrow(
        /expected a string or number/,
      );
      expect(() => normalize({} as any)).toThrow(/expected a string or number/);
      expect(() => normalize([] as any)).toThrow(/expected a string or number/);
      expect(() => normalize(true as any)).toThrow(
        /expected a string or number/,
      );
    });
  });
});
