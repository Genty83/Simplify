import { describe, it, expect } from "vitest";

import {
  isBreakpointKey,
  parseInlineBreakpoint,
  resolveBreakpointToPx,
  extractDefaultEntry,
  extractNamedEntries,
  extractDynamicKeys,
  expandDynamicEntries,
} from "../../../core/utils/responsiveHelpers";

import { breakpoints } from "../../../types";
import { defaultBreakpointMap } from "../../../config";

describe("core/utils/responsiveHelpers", () => {
  /* ==========================================================================
   * isBreakpointKey
   * ======================================================================= */

  describe("isBreakpointKey()", () => {
    it("accepts named breakpoints", () => {
      for (const bp of breakpoints) {
        expect(isBreakpointKey(bp)).toBe(true);
      }
    });

    it("accepts inline breakpoints", () => {
      expect(isBreakpointKey("@600")).toBe(true);
    });

    it("accepts max breakpoints", () => {
      expect(isBreakpointKey("@max:800")).toBe(true);
    });

    it("accepts between breakpoints", () => {
      expect(isBreakpointKey("@between:600:900")).toBe(true);
    });

    it("rejects unknown keys", () => {
      expect(isBreakpointKey("foo")).toBe(false);
      expect(isBreakpointKey("@weird")).toBe(false);
    });
  });

  /* ==========================================================================
   * parseInlineBreakpoint
   * ======================================================================= */

  describe("parseInlineBreakpoint()", () => {
    it("parses valid inline breakpoints", () => {
      expect(parseInlineBreakpoint("@500")).toBe(500);
    });

    it("returns null for non-inline keys", () => {
      expect(parseInlineBreakpoint("tablet")).toBeNull();
      expect(parseInlineBreakpoint("@max:800")).toBeNull();
    });

    it("returns null for invalid inline values", () => {
      expect(parseInlineBreakpoint("@abc")).toBeNull();
    });
  });

  /* ==========================================================================
   * resolveBreakpointToPx
   * ======================================================================= */

  describe("resolveBreakpointToPx()", () => {
    it("resolves named breakpoints", () => {
      for (const bp of breakpoints) {
        expect(resolveBreakpointToPx(bp)).toBe(defaultBreakpointMap[bp]);
      }
    });

    it("resolves inline breakpoints", () => {
      expect(resolveBreakpointToPx("@600")).toBe(600);
    });

    it("resolves max breakpoints", () => {
      expect(resolveBreakpointToPx("@max:800")).toBe(800);
    });

    it("resolves between breakpoints using the min value", () => {
      expect(resolveBreakpointToPx("@between:600:900")).toBe(600);
    });

    it("returns 0 for invalid keys", () => {
      expect(resolveBreakpointToPx("foo")).toBe(0);
      expect(resolveBreakpointToPx("@max:abc")).toBe(0);
    });
  });

  /* ==========================================================================
   * extractDefaultEntry
   * ======================================================================= */

  describe("extractDefaultEntry()", () => {
    it("extracts default entry", () => {
      const raw = { default: "red" };
      expect(extractDefaultEntry(raw)).toEqual([{ value: "red" }]);
    });

    it("returns empty array when no default", () => {
      expect(extractDefaultEntry({})).toEqual([]);
    });
  });

  /* ==========================================================================
   * extractNamedEntries
   * ======================================================================= */

  describe("extractNamedEntries()", () => {
    it("extracts named entries in canonical order", () => {
      const raw = {
        [breakpoints[1]]: "b",
        [breakpoints[0]]: "a",
      };

      expect(extractNamedEntries(raw)).toEqual([
        { breakpoint: breakpoints[0], value: "a" },
        { breakpoint: breakpoints[1], value: "b" },
      ]);
    });

    it("skips undefined entries", () => {
      const raw = { [breakpoints[0]]: "a" };
      expect(extractNamedEntries(raw)).toEqual([
        { breakpoint: breakpoints[0], value: "a" },
      ]);
    });
  });

  /* ==========================================================================
   * extractDynamicKeys
   * ======================================================================= */

  describe("extractDynamicKeys()", () => {
    it("extracts only dynamic keys", () => {
      const raw = {
        default: "x",
        [breakpoints[0]]: "named",
        "@600": "inline",
        "@max:800": "max",
        "@between:600:900": "between",
        foo: "ignored",
      };

      expect(extractDynamicKeys(raw)).toEqual([
        "@600",
        "@max:800",
        "@between:600:900",
      ]);
    });
  });

  /* ==========================================================================
   * expandDynamicEntries
   * ======================================================================= */

  describe("expandDynamicEntries()", () => {
    it("expands and sorts dynamic entries by px", () => {
      const raw = {
        "@max:800": "max",
        "@600": "inline",
        "@between:500:900": "between",
      };

      const keys = ["@max:800", "@600", "@between:500:900"];

      expect(expandDynamicEntries(raw, keys)).toEqual([
        { breakpoint: "@between:500:900", value: "between" }, // 500px
        { breakpoint: "@600", value: "inline" },               // 600px
        { breakpoint: "@max:800", value: "max" },              // 800px
      ]);
    });
  });
});
