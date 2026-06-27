import { describe, it, expect } from "vitest";

import { suiLayout } from "../../language/suiLayout";
import { rs, states } from "../../services";
import { suiSheet } from "../../core";

describe("suiLayout – SimplifyUI layout utility", () => {

  it("has the correct function name", () => {
    // createSuiUtility() always produces a function literally named "utility"
    expect(suiLayout.name).toBe("utility");
  });

  it("produces atomic rules via .atomize()", () => {
    const cls = suiLayout({
      layout: "flex",
      flow: "row",
      space: "12px",
    }).atomize();

    expect(typeof cls).toBe("string");
    expect(cls.length).toBeGreaterThan(0);
  });

  it("supports semantic → CSS mapping", () => {
    const cls = suiLayout({
      layout: "grid",
      flow: "column",
      spaceX: "16px",
      place: "center",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports responsive values via rs()", () => {
    const cls = suiLayout({
      layout: rs({
        mobile: "flex",
        tablet: "grid",
      }),
      usingBreakpoints: ["mobile", "tablet"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports state wrappers via states()", () => {
    const cls = suiLayout({
      layout: states({ hover: "flex" }),
      align: states({ pressed: "center" as any }),
      usingStates: ["hover", "pressed"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports raw CSS props", () => {
    const cls = suiLayout({
      display: "flex",
      flexDirection: "row",
      gap: "12px",
      justifyContent: "center",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports container metadata passthrough", () => {
  const cls = suiLayout({
    containerType: "inline-size",
    containerName: "card",
  }).atomize();

  expect(typeof cls).toBe("string");
});

  it("is recognized by suiSheet() and produces merged classnames", () => {
    const sheet = suiSheet({
      layout: {
        layout: "flex",
        align: "center",
        space: "12px",
      },
    });

    const className = String(sheet); // SuiSheetReturn is a String object

    expect(typeof className).toBe("string");
    expect(className.length).toBeGreaterThan(0);
  });

  it("produces deterministic classnames for identical input", () => {
    const a = suiLayout({ layout: "flex" }).atomize();
    const b = suiLayout({ layout: "flex" }).atomize();

    expect(a).toBe(b);
  });

  it("produces different classnames for different input", () => {
    const a = suiLayout({ layout: "flex" }).atomize();
    const b = suiLayout({ layout: "grid" }).atomize();

    expect(a).not.toBe(b);
  });
});
