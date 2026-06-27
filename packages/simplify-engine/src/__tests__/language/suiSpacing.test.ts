import { describe, it, expect } from "vitest";

import { suiSpacing } from "../../language/suiSpacing";
import { rs, states } from "../../services";
import { suiSheet } from "../../core";

describe("suiSpacing – SimplifyUI spacing utility", () => {

  it("has the correct function name", () => {
    // createSuiUtility() always produces a function literally named "utility"
    expect(suiSpacing.name).toBe("utility");
  });

  it("produces atomic rules via .atomize()", () => {
    const cls = suiSpacing({
      padding: "12px",
      marginTop: "8px",
    }).atomize();

    expect(typeof cls).toBe("string");
    expect(cls.length).toBeGreaterThan(0);
  });

  it("supports logical padding and margin properties", () => {
    const cls = suiSpacing({
      paddingInline: "16px",
      paddingBlock: "24px",
      marginInlineStart: "10px",
      marginBlockEnd: "20px",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports gap properties", () => {
    const cls = suiSpacing({
      gap: "12px",
      rowGap: "8px",
      columnGap: "16px",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports responsive values via rs()", () => {
    const cls = suiSpacing({
      padding: rs({
        mobile: "8px",
        tablet: "16px",
      }),
      usingBreakpoints: ["mobile", "tablet"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports state wrappers via states()", () => {
    const cls = suiSpacing({
      marginTop: states({ hover: "20px" }),
      paddingBottom: states({ pressed: "40px" as any }),
      usingStates: ["hover", "pressed"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("is recognized by suiSheet() and produces merged classnames", () => {
    const sheet = suiSheet({
      spacing: {
        padding: "24px",
        margin: "12px",
      },
    });

    const className = String(sheet); // SuiSheetReturn is a String object

    expect(typeof className).toBe("string");
    expect(className.length).toBeGreaterThan(0);
  });

  it("produces deterministic classnames for identical input", () => {
    const a = suiSpacing({ padding: "12px" }).atomize();
    const b = suiSpacing({ padding: "12px" }).atomize();

    expect(a).toBe(b);
  });

  it("produces different classnames for different input", () => {
    const a = suiSpacing({ padding: "12px" }).atomize();
    const b = suiSpacing({ padding: "24px" }).atomize();

    expect(a).not.toBe(b);
  });
});
