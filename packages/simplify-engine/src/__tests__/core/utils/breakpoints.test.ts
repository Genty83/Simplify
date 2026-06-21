import { describe, it, expect, beforeEach } from "vitest";
import {
  at,
  to,
  between,
  isContainerMedia,
  resolveBreakpoint,
  getBreakpoints,
  setBreakpoints,
  defineBreakpoint,
  resetBreakpoints,
} from "../../../core/utils";

import { defaultBreakpointMap } from "../../../config";

describe("core/utils/breakpoints", () => {
  beforeEach(() => {
    resetBreakpoints();
  });

  /* ==========================================================================
   * Structural type guards
   * ======================================================================= */

  describe("isContainerMedia", () => {
    it("returns true for valid container queries", () => {
      expect(isContainerMedia("@container (min-width: 300px)")).toBe(true);
    });

    it("returns false for malformed container queries", () => {
      expect(isContainerMedia("@container")).toBe(false);
      expect(isContainerMedia("@container foo")).toBe(false);
      expect(isContainerMedia("@container(")).toBe(false);
      expect(isContainerMedia(123 as any)).toBe(false);
    });
  });

  /* ==========================================================================
   * Breakpoint creators
   * ======================================================================= */

  describe("at()", () => {
    it("creates inline breakpoints", () => {
      expect(at(768)).toBe("@768");
    });

    it("throws on invalid values", () => {
      expect(() => at(-1)).toThrow();
      expect(() => at(NaN)).toThrow();
    });
  });

  describe("to()", () => {
    it("creates max breakpoints", () => {
      expect(to(1024)).toBe("@max:1024");
    });

    it("throws on invalid values", () => {
      expect(() => to(-5)).toThrow();
      expect(() => to(Infinity)).toThrow();
    });
  });

  describe("between()", () => {
    it("creates between breakpoints", () => {
      expect(between(600, 900)).toBe("@between:600:900");
    });

    it("throws when min >= max", () => {
      expect(() => between(900, 600)).toThrow();
      expect(() => between(600, 600)).toThrow();
    });

    it("throws on invalid values", () => {
      expect(() => between(-1, 500)).toThrow();
      expect(() => between(200, NaN)).toThrow();
    });
  });

  /* ==========================================================================
   * Resolver pipeline
   * ======================================================================= */

  describe("resolveBreakpoint()", () => {
    it("resolves inline breakpoints", () => {
      expect(resolveBreakpoint("@768")).toEqual({ type: "min", min: 768 });
    });

    it("resolves max breakpoints", () => {
      expect(resolveBreakpoint("@max:1024")).toEqual({
        type: "max",
        max: 1024,
      });
    });

    it("resolves between breakpoints", () => {
      expect(resolveBreakpoint("@between:600:900")).toEqual({
        type: "between",
        min: 600,
        max: 900,
      });
    });

    it("resolves named breakpoints", () => {
      expect(resolveBreakpoint("tablet")).toEqual({
        type: "min",
        min: defaultBreakpointMap.tablet,
      });
    });

    it("throws on unknown breakpoints", () => {
      expect(() => resolveBreakpoint("unknown" as any)).toThrow(
        /Unknown named breakpoint/,
      );
    });

    it("respects pipeline ordering", () => {
      // "@max:768" must resolve as max, not named "max"
      expect(resolveBreakpoint("@max:768")).toEqual({ type: "max", max: 768 });

      // "@between:600:900" must resolve as between, not named "between"
      expect(resolveBreakpoint("@between:600:900")).toEqual({
        type: "between",
        min: 600,
        max: 900,
      });

      // "@768" must resolve as inline, not named "768"
      expect(resolveBreakpoint("@768")).toEqual({ type: "min", min: 768 });
    });
  });

  /* ==========================================================================
   * Breakpoint configuration API
   * ======================================================================= */

  describe("getBreakpoints()", () => {
    it("returns a shallow copy", () => {
      const bp = getBreakpoints();
      expect(bp).toEqual(defaultBreakpointMap);
      expect(bp).not.toBe(defaultBreakpointMap);
    });
  });

  describe("setBreakpoints()", () => {
    it("overrides existing breakpoints", () => {
      setBreakpoints({ tablet: 700 });
      expect(getBreakpoints().tablet).toBe(700);
    });

    it("adds new breakpoints", () => {
      setBreakpoints({ custom: 1234 });
      expect(getBreakpoints().custom).toBe(1234);
    });

    it("throws on invalid values", () => {
      expect(() => setBreakpoints({ foo: -1 })).toThrow();
      expect(() => setBreakpoints({ bar: NaN })).toThrow();
    });

    it("affects named resolution", () => {
      setBreakpoints({ mobile: 111 });
      expect(resolveBreakpoint("mobile")).toEqual({
        type: "min",
        min: 111,
      });
    });
  });

  describe("defineBreakpoint()", () => {
  it("adds a new breakpoint", () => {
    defineBreakpoint("xl", 2000);

    expect(resolveBreakpoint("xl" as any)).toEqual({
      type: "min",
      min: 2000,
    });
  });

  it("updates an existing breakpoint", () => {
    defineBreakpoint("mobile", 500);
    expect(resolveBreakpoint("mobile")).toEqual({
      type: "min",
      min: 500,
    });
  });

  it("throws on invalid px", () => {
    expect(() => defineBreakpoint("bad", -1)).toThrow();
    expect(() => defineBreakpoint("bad", NaN)).toThrow();
  });
});


  describe("resetBreakpoints()", () => {
    it("restores the default map", () => {
      setBreakpoints({ mobile: 999 });
      resetBreakpoints();
      expect(getBreakpoints()).toEqual(defaultBreakpointMap);
    });
  });
});

