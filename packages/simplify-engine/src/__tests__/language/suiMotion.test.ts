import { describe, it, expect } from "vitest";

import { suiMotion } from "../../language/suiMotion";
import { rs, states } from "../../services";
import { suiSheet } from "../../core";

describe("suiMotion – SimplifyUI motion utility", () => {

  it("has the correct function name", () => {
    // createSuiUtility() always produces a function literally named "utility"
    expect(suiMotion.name).toBe("utility");
  });

  it("produces atomic rules via .atomize()", () => {
    const cls = suiMotion({
      transitionProperty: "opacity",
      transitionDuration: 150,
      transitionTimingFunction: "ease-out",
    }).atomize();

    expect(typeof cls).toBe("string");
    expect(cls.length).toBeGreaterThan(0);
  });

  it("supports animation properties", () => {
    const cls = suiMotion({
      animationName: "fade-in",
      animationDuration: "300ms",
      animationTimingFunction: "ease-in-out",
      animationIterationCount: "infinite",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports transform properties", () => {
    const cls = suiMotion({
      transform: "scale(1.1)",
      transformOrigin: "center",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports responsive values via rs()", () => {
    const cls = suiMotion({
      transitionDuration: rs({
        mobile: "150ms",
        tablet: "300ms",
      }),
      usingBreakpoints: ["mobile", "tablet"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports state wrappers via states()", () => {
    const cls = suiMotion({
      transform: states({ hover: "scale(1.03)" }),
      animationPlayState: states({ pressed: "paused" as any }),
      usingStates: ["hover", "pressed"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("is recognized by suiSheet() and produces merged classnames", () => {
    const sheet = suiSheet({
      motion: {
        transitionProperty: "opacity",
        transitionDuration: "200ms",
        transform: "scale(1.05)",
      },
    });

    const className = String(sheet); // SuiSheetReturn is a String object

    expect(typeof className).toBe("string");
    expect(className.length).toBeGreaterThan(0);
  });

  it("produces deterministic classnames for identical input", () => {
    const a = suiMotion({ transitionDuration: 150 }).atomize();
    const b = suiMotion({ transitionDuration: 150 }).atomize();

    expect(a).toBe(b);
  });

  it("produces different classnames for different input", () => {
    const a = suiMotion({ transitionDuration: 150 }).atomize();
    const b = suiMotion({ transitionDuration: 300 }).atomize();

    expect(a).not.toBe(b);
  });
});
