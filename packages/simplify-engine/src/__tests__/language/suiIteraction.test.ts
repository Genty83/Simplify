import { describe, it, expect } from "vitest";

import { suiInteraction } from "../../language/suiInteraction";
import { rs, states } from "../../services";
import { suiSheet } from "../../core";

describe("suiInteraction – SimplifyUI interaction utility", () => {
  it("has the correct function name", () => {
    expect(suiInteraction.name).toBe("utility");
  });

  it("produces atomic rules via .atomize()", () => {
    const cls = suiInteraction({
      cursor: "pointer",
      userSelect: "none",
    }).atomize();

    expect(typeof cls).toBe("string");
    expect(cls.length).toBeGreaterThan(0);
  });

  it("supports responsive values via rs()", () => {
    const cls = suiInteraction({
      cursor: rs({
        mobile: "default",
        tablet: "pointer",
      }),
      usingBreakpoints: ["mobile", "tablet"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports state wrappers via states()", () => {
    const cls = suiInteraction({
      cursor: states({ hover: "pointer" }),
      opacity: states({ pressed: 0.5 as any }),
      usingStates: ["hover", "pressed"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("is recognized by suiSheet() and produces merged classnames", () => {
    const sheet = suiSheet({
      interaction: {
        cursor: "pointer",
        opacity: 0.8,
      },
    });

    const className = String(sheet); // SuiSheetReturn is a String object

    expect(typeof className).toBe("string");
    expect(className.length).toBeGreaterThan(0);
  });

  it("produces deterministic classnames for identical input", () => {
    const a = suiInteraction({ cursor: "pointer" }).atomize();
    const b = suiInteraction({ cursor: "pointer" }).atomize();

    expect(a).toBe(b);
  });

  it("produces different classnames for different input", () => {
    const a = suiInteraction({ cursor: "pointer" }).atomize();
    const b = suiInteraction({ cursor: "default" }).atomize();

    expect(a).not.toBe(b);
  });
});
