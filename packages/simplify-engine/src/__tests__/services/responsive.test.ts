import { describe, it, expect, beforeEach } from "vitest";

import {
  rs,
  isResponsive,
  tupleToResponsive,
  isRawResponsiveObject,
  expandResponsive,
  autoRs,
  expandResponsiveValue,
} from "../../services/responsive";

import {
  isBreakpointKey,
  extractDefaultEntry,
  extractNamedEntries,
  extractDynamicKeys,
  expandDynamicEntries,
} from "../../core/utils/responsiveHelpers";

import type { AnyBreakpoint, ResponsiveValue } from "../../types";

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const breakpoints: AnyBreakpoint[] = [
  "mobile",
  "tablet",
  "laptop",
  "desktop",
  "monitor",
  "wide",
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("responsive.ts – responsive services", () => {
  beforeEach(() => {
    // No mocks needed — everything is pure
  });

  // -------------------------------------------------------------------------
  // rs()
  // -------------------------------------------------------------------------

  describe("rs", () => {
    it("wraps a responsive value", () => {
      const wrapped = rs({ mobile: 10 });

      expect(wrapped).toEqual({
        __responsive: true,
        value: { mobile: 10 },
      });
    });
  });

  // -------------------------------------------------------------------------
  // isResponsive()
  // -------------------------------------------------------------------------

  describe("isResponsive", () => {
    it("detects responsive wrappers", () => {
      expect(isResponsive(rs({ mobile: 10 }))).toBe(true);
    });

    it("rejects non-wrappers", () => {
      expect(isResponsive({ mobile: 10 })).toBe(false);
      expect(isResponsive(null)).toBe(false);
      expect(isResponsive(undefined)).toBe(false);
      expect(isResponsive([])).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // tupleToResponsive()
  // -------------------------------------------------------------------------

  describe("tupleToResponsive", () => {
    it("maps tuple entries to breakpoints", () => {
      const tuple = [10, 20, 30];
      const out = tupleToResponsive(tuple, breakpoints);

      expect(out).toEqual({
        mobile: 10,
        tablet: 20,
        laptop: 30,
      });
    });

    it("stops when breakpoints run out", () => {
      const tuple = [10, 20, 30];
      const out = tupleToResponsive(tuple, ["mobile"] as const);

      expect(out).toEqual({ mobile: 10 });
    });
  });

  // -------------------------------------------------------------------------
  // isRawResponsiveObject()
  // -------------------------------------------------------------------------

  describe("isRawResponsiveObject", () => {
    it("detects plain responsive objects", () => {
      expect(isRawResponsiveObject({ mobile: 10, tablet: 20 })).toBe(true);
    });

    it("rejects empty objects", () => {
      expect(isRawResponsiveObject({})).toBe(false);
    });

    it("rejects arrays", () => {
      expect(isRawResponsiveObject([10, 20])).toBe(false);
    });

    it("rejects non-breakpoint keys", () => {
      expect(isRawResponsiveObject({ foo: 10 })).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // expandResponsive()
  // -------------------------------------------------------------------------

  describe("expandResponsive", () => {
    it("expands default + named + dynamic entries", () => {
      const value: ResponsiveValue<number> = {
        default: 5,
        mobile: 10,
        "@600": 20,
      };

      const out = expandResponsive(value);

      expect(out).toEqual([
        { breakpoint: undefined, value: 5 }, // default
        { breakpoint: "mobile", value: 10 }, // named
        { breakpoint: "@600", value: 20 },   // dynamic
      ]);
    });

    it("returns a fallback entry when no entries exist", () => {
      const out = expandResponsive({} as any);

      expect(out).toEqual([{ value: {} }]);
    });
  });

  // -------------------------------------------------------------------------
  // autoRs()
  // -------------------------------------------------------------------------

  describe("autoRs", () => {
    it("wraps tuples into responsive wrappers", () => {
      const out = autoRs([10, 20], ["mobile", "tablet"]);

      expect(out).toEqual({
        __responsive: true,
        value: { mobile: 10, tablet: 20 },
      });
    });

    it("wraps raw responsive objects", () => {
      const out = autoRs({ mobile: 10 }, breakpoints);

      expect(out).toEqual({
        __responsive: true,
        value: { mobile: 10 },
      });
    });

    it("returns non-responsive values unchanged", () => {
      expect(autoRs(10, breakpoints)).toBe(10);
      expect(autoRs("x", breakpoints)).toBe("x");
    });
  });

  // -------------------------------------------------------------------------
  // expandResponsiveValue()
  // -------------------------------------------------------------------------

  describe("expandResponsiveValue", () => {
    it("expands wrapped responsive values", () => {
      const wrapped = rs({ mobile: 10, tablet: 20 });

      const out = expandResponsiveValue(wrapped, breakpoints);

      expect(out).toEqual([
        { breakpoint: "mobile", value: 10 },
        { breakpoint: "tablet", value: 20 },
      ]);
    });

    it("expands tuples", () => {
      const out = expandResponsiveValue([10, 20], ["mobile", "tablet"]);

      expect(out).toEqual([
        { breakpoint: "mobile", value: 10 },
        { breakpoint: "tablet", value: 20 },
      ]);
    });

    it("expands raw responsive objects", () => {
      const out = expandResponsiveValue({ mobile: 10 }, breakpoints);

      expect(out).toEqual([{ breakpoint: "mobile", value: 10 }]);
    });

    it("returns fallback entry for non-responsive values", () => {
      const out = expandResponsiveValue(99, breakpoints);

      expect(out).toEqual([{ value: 99 }]);
    });
  });
});
