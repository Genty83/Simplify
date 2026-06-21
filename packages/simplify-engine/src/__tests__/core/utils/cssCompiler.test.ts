import { describe, it, expect } from "vitest";

import { ruleToCSS } from "../../../core";
import { stateToSelector } from "../../../config";

// We import helpers directly to avoid barrel-type issues
import { resolveBreakpoint } from "../../../core/utils/breakpoints";

describe("core/compiler/ruleToCSS", () => {
  /* ==========================================================================
   * Base selector + property/value emission
   * ======================================================================= */

  it("emits a simple base rule", () => {
    const rule = {
      property: "backgroundColor",
      value: "red",
      state: "base",
    };

    expect(ruleToCSS(rule as any, "abc123")).toBe(
      ".abc123 { background-color: red; }"
    );
  });

  it("converts property names to kebab-case", () => {
    const rule = {
      property: "marginTop",
      value: 10,
      state: "base",
    };

    expect(ruleToCSS(rule as any, "x")).toBe(
      ".x { margin-top: 10; }"
    );
  });

  /* ==========================================================================
   * State selectors
   * ======================================================================= */

  it("appends state selectors when state is not base", () => {
    const rule = {
      property: "color",
      value: "blue",
      state: "hover",
    };

    expect(ruleToCSS(rule as any, "btn")).toBe(
      `.btn${stateToSelector.hover} { color: blue; }`
    );
  });

  it("throws on invalid state", () => {
    const rule = {
      property: "color",
      value: "blue",
      state: "unknown",
    };

    expect(() => ruleToCSS(rule as any, "x")).toThrow(/Invalid rule state/);
  });

  /* ==========================================================================
   * Class name validation
   * ======================================================================= */

  it("throws on invalid class names", () => {
    const rule = { property: "color", value: "red", state: "base" };

    expect(() => ruleToCSS(rule as any, "")).toThrow(/Invalid class name/);
    expect(() => ruleToCSS(rule as any, "bad name")).toThrow(/Invalid class name/);
  });

  /* ==========================================================================
   * Rule shape validation
   * ======================================================================= */

  it("throws on missing property", () => {
    const rule = { property: "", value: "red", state: "base" };
    expect(() => ruleToCSS(rule as any, "x")).toThrow(/Invalid rule field "property"/);
  });

  it("throws on invalid value", () => {
    const rule = { property: "color", value: null, state: "base" };
    expect(() => ruleToCSS(rule as any, "x")).toThrow(/Invalid rule field "value"/);
  });

  it("throws when value is not a primitive", () => {
    const rule = {
      property: "color",
      value: { responsive: true },
      state: "base",
    };

    expect(() => ruleToCSS(rule as any, "x")).toThrow(/AtomicRule.value must be a primitive/);
  });

  /* ==========================================================================
   * Container wrapper
   * ======================================================================= */

  it("wraps rule in explicit container wrapper", () => {
    const rule = {
      property: "color",
      value: "red",
      state: "base",
      container: "@container (min-width: 500px)",
    };

    expect(ruleToCSS(rule as any, "x")).toBe(
      `@container (min-width: 500px) { .x { color: red; } }`
    );
  });

  /* ==========================================================================
   * Container media wrapper
   * ======================================================================= */

  it("wraps rule in container media query", () => {
    const rule = {
      property: "color",
      value: "red",
      state: "base",
      breakpoint: "@container (min-width: 400px)",
    };

    expect(ruleToCSS(rule as any, "x")).toBe(
      `@container (min-width: 400px) { .x { color: red; } }`
    );
  });

  /* ==========================================================================
   * Viewport breakpoints
   * ======================================================================= */

  it("wraps rule in min-width media query", () => {
    const rule = {
      property: "color",
      value: "red",
      state: "base",
      breakpoint: "@768",
    };

    expect(ruleToCSS(rule as any, "x")).toBe(
      `@media (min-width: 768px) { .x { color: red; } }`
    );
  });

  it("wraps rule in max-width media query", () => {
    const rule = {
      property: "color",
      value: "red",
      state: "base",
      breakpoint: "@max:1024",
    };

    expect(ruleToCSS(rule as any, "x")).toBe(
      `@media (max-width: 1024px) { .x { color: red; } }`
    );
  });

  it("wraps rule in between media query", () => {
    const rule = {
      property: "color",
      value: "red",
      state: "base",
      breakpoint: "@between:600:900",
    };

    expect(ruleToCSS(rule as any, "x")).toBe(
      `@media (min-width: 600px) and (max-width: 900px) { .x { color: red; } }`
    );
  });

  /* ==========================================================================
   * Wrapper pipeline ordering
   * ======================================================================= */

  it("prefers explicit container wrapper over container media", () => {
    const rule = {
      property: "color",
      value: "red",
      state: "base",
      container: "@container (min-width: 500px)",
      breakpoint: "@container (min-width: 400px)",
    };

    expect(ruleToCSS(rule as any, "x")).toBe(
      `@container (min-width: 500px) { .x { color: red; } }`
    );
  });

  it("prefers container media over viewport breakpoints", () => {
    const rule = {
      property: "color",
      value: "red",
      state: "base",
      breakpoint: "@container (min-width: 400px)",
    };

    expect(ruleToCSS(rule as any, "x")).toBe(
      `@container (min-width: 400px) { .x { color: red; } }`
    );
  });
});
