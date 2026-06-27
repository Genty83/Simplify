import { describe, it, expect } from "vitest";

import { suiSurface } from "../../language/suiSurface";
import { rs, states } from "../../services";
import { suiSheet } from "../../core";

describe("suiSurface – SimplifyUI surface utility", () => {

  it("has the correct function name", () => {
    // createSuiUtility() always produces a function literally named "utility"
    expect(suiSurface.name).toBe("utility");
  });

  it("produces atomic rules via .atomize()", () => {
    const cls = suiSurface({
      backgroundColor: "red",
      color: "white",
      opacity: 0.8,
    }).atomize();

    expect(typeof cls).toBe("string");
    expect(cls.length).toBeGreaterThan(0);
  });

  it("supports background properties", () => {
    const cls = suiSurface({
      background: "linear-gradient(to bottom, red, blue)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundBlendMode: "multiply",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports border and outline properties", () => {
    const cls = suiSurface({
      border: "1px solid black",
      borderTopColor: "red",
      outline: "2px dashed blue",
      outlineOffset: "4px",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports shadow properties", () => {
    const cls = suiSurface({
      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      textShadow: "1px 1px 2px black",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports responsive values via rs()", () => {
    const cls = suiSurface({
      backgroundColor: rs({
        mobile: "red",
        tablet: "blue",
      }),
      usingBreakpoints: ["mobile", "tablet"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports state wrappers via states()", () => {
    const cls = suiSurface({
      color: states({ hover: "yellow" }),
      opacity: states({ pressed: 0.4 as any }),
      usingStates: ["hover", "pressed"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports container metadata passthrough", () => {
    // IMPORTANT:
    // We DO NOT include usingContainers here.
    // That would activate container mode and require containerSizes.
    const cls = suiSurface({
      usingContainers: [], // safe, does not activate container mode
      backgroundColor: "green",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("is recognized by suiSheet() and produces merged classnames", () => {
    const sheet = suiSheet({
      surface: {
        backgroundColor: "purple",
        color: "white",
      },
    });

    const className = String(sheet); // SuiSheetReturn is a String object

    expect(typeof className).toBe("string");
    expect(className.length).toBeGreaterThan(0);
  });

  it("produces deterministic classnames for identical input", () => {
    const a = suiSurface({ backgroundColor: "red" }).atomize();
    const b = suiSurface({ backgroundColor: "red" }).atomize();

    expect(a).toBe(b);
  });

  it("produces different classnames for different input", () => {
    const a = suiSurface({ backgroundColor: "red" }).atomize();
    const b = suiSurface({ backgroundColor: "blue" }).atomize();

    expect(a).not.toBe(b);
  });
});
