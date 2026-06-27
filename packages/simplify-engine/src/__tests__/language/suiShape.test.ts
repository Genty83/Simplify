import { describe, it, expect } from "vitest";

import { suiShape } from "../../language/suiShape";
import { rs, states } from "../../services";
import { suiSheet } from "../../core";

describe("suiShape – SimplifyUI shape utility", () => {

  it("has the correct function name", () => {
    // createSuiUtility() always produces a function literally named "utility"
    expect(suiShape.name).toBe("utility");
  });

  it("produces atomic rules via .atomize()", () => {
    const cls = suiShape({
      borderRadius: "8px",
      clipPath: "inset(0 round 12px)",
    }).atomize();

    expect(typeof cls).toBe("string");
    expect(cls.length).toBeGreaterThan(0);
  });

  it("supports individual corner radii", () => {
    const cls = suiShape({
      borderTopLeftRadius: "4px",
      borderTopRightRadius: "6px",
      borderBottomRightRadius: "8px",
      borderBottomLeftRadius: "10px",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports responsive values via rs()", () => {
    const cls = suiShape({
      borderRadius: rs({
        mobile: "4px",
        tablet: "8px",
      }),
      usingBreakpoints: ["mobile", "tablet"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports state wrappers via states()", () => {
    const cls = suiShape({
      borderRadius: states({ hover: "12px" }),
      clipPath: states({ pressed: "circle(50%)" as any }),
      usingStates: ["hover", "pressed"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports advanced shape properties", () => {
    const cls = suiShape({
      shapeOutside: "circle(50%)",
      shapeMargin: "12px",
      borderStartStartRadius: "4px",
      borderEndEndRadius: "10px",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("is recognized by suiSheet() and produces merged classnames", () => {
    const sheet = suiSheet({
      shape: {
        borderRadius: "12px",
        clipPath: "inset(0 round 16px)",
      },
    });

    const className = String(sheet); // SuiSheetReturn is a String object

    expect(typeof className).toBe("string");
    expect(className.length).toBeGreaterThan(0);
  });

  it("produces deterministic classnames for identical input", () => {
    const a = suiShape({ borderRadius: "8px" }).atomize();
    const b = suiShape({ borderRadius: "8px" }).atomize();

    expect(a).toBe(b);
  });

  it("produces different classnames for different input", () => {
    const a = suiShape({ borderRadius: "8px" }).atomize();
    const b = suiShape({ borderRadius: "16px" }).atomize();

    expect(a).not.toBe(b);
  });
});
