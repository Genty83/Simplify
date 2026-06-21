import { describe, it, expect } from "vitest";

import {
  parseNamedSize,
  parseInlineWidth,
  parseInlineHeight,
  parseBetweenRange,
  LEGACY_PARSERS,
} from "../../../core/utils/containerLegacy";

import {
  minWidth,
  minHeight,
  maxWidth,
  joinConditions,
} from "../../../core/utils/containerConditions";

describe("core/utils/containerLegacy", () => {
  const sizes = {
    small: 300,
    medium: 600,
  };

  /* ==========================================================================
   * parseNamedSize
   * ======================================================================= */

  describe("parseNamedSize()", () => {
    const sizes = {
      small: "300px",
      medium: "600px",
    };

    it("parses known named sizes", () => {
      expect(parseNamedSize("small", sizes)).toBe(
        `@container ${minWidth("300px")}`,
      );
    });

    it("returns null for unknown names", () => {
      expect(parseNamedSize("large", sizes)).toBeNull();
    });
  });

  /* ==========================================================================
   * parseInlineWidth
   * ======================================================================= */

  describe("parseInlineWidth()", () => {
    it("parses inline width conditions", () => {
      expect(parseInlineWidth("width:500")).toBe(
        `@container ${minWidth("500")}`,
      );
    });

    it("returns null for non-width keys", () => {
      expect(parseInlineWidth("height:500")).toBeNull();
      expect(parseInlineWidth("foo")).toBeNull();
    });
  });

  /* ==========================================================================
   * parseInlineHeight
   * ======================================================================= */

  describe("parseInlineHeight()", () => {
    it("parses inline height conditions", () => {
      expect(parseInlineHeight("height:400")).toBe(
        `@container ${minHeight("400")}`,
      );
    });

    it("returns null for non-height keys", () => {
      expect(parseInlineHeight("width:400")).toBeNull();
      expect(parseInlineHeight("foo")).toBeNull();
    });
  });

  /* ==========================================================================
   * parseBetweenRange
   * ======================================================================= */

  describe("parseBetweenRange()", () => {
    it("parses between-range conditions", () => {
      const expected = joinConditions([minWidth("600"), maxWidth("900")]);
      expect(parseBetweenRange("between:600:900")).toBe(
        `@container ${expected}`,
      );
    });

    it("returns null for non-between keys", () => {
      expect(parseBetweenRange("width:600")).toBeNull();
      expect(parseBetweenRange("foo")).toBeNull();
    });
  });

  /* ==========================================================================
   * LEGACY_PARSERS ordering
   * ======================================================================= */

  describe("LEGACY_PARSERS", () => {
    it("resolves using first matching parser", () => {
      const run = (key: string) => {
        for (const parser of LEGACY_PARSERS) {
          const out = parser(key as any, sizes as any);
          if (out) return out;
        }
        return null;
      };

      // Named size wins first
      expect(run("small")).toBe(`@container ${minWidth(300)}`);

      // Inline width wins before inline height
      expect(run("width:500")).toBe(`@container ${minWidth("500")}`);

      // Inline height wins before between
      expect(run("height:400")).toBe(`@container ${minHeight("400")}`);

      // Between-range last
      const expected = joinConditions([minWidth("600"), maxWidth("900")]);
      expect(run("between:600:900")).toBe(`@container ${expected}`);
    });
  });
});
