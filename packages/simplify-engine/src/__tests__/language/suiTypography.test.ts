import { describe, it, expect } from "vitest";

import { suiTypography } from "../../language/suiTypography";
import { rs, states } from "../../services";
import { suiSheet } from "../../core";

describe("suiTypography – SimplifyUI typography utility", () => {
  it("has the correct function name", () => {
    // createSuiUtility() always produces a function literally named "utility"
    expect(suiTypography.name).toBe("utility");
  });

  it("produces atomic rules via .atomize()", () => {
    const cls = suiTypography({
      fontSize: "16px",
      fontWeight: 600,
      lineHeight: 1.4,
    }).atomize();

    expect(typeof cls).toBe("string");
    expect(cls.length).toBeGreaterThan(0);
  });

  it("supports font family, style, and variant", () => {
    const cls = suiTypography({
      fontFamily: "Inter, sans-serif",
      fontStyle: "italic",
      fontVariant: "small-caps",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports line height and letter spacing", () => {
    const cls = suiTypography({
      lineHeight: 1.6,
      letterSpacing: "0.5px",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports text alignment, transform, and decoration", () => {
    const cls = suiTypography({
      textAlign: "center",
      textTransform: "uppercase",
      textDecoration: "underline",
      textDecorationColor: "red",
      textDecorationThickness: "2px",
      textUnderlineOffset: "4px",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports white-space and overflow text properties", () => {
    const cls = suiTypography({
      whiteSpace: "nowrap",
      textOverflow: "ellipsis",
      wordBreak: "break-word",
      overflowWrap: "anywhere",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports responsive values via rs()", () => {
    const cls = suiTypography({
      fontSize: rs({
        mobile: "14px",
        tablet: "16px",
      }),
      usingBreakpoints: ["mobile", "tablet"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports state wrappers via states()", () => {
    const cls = suiTypography({
      fontWeight: states({ hover: 700 as any }), // ⭐ key change
      usingStates: ["hover"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports container metadata passthrough", () => {
    // IMPORTANT:
    // We DO NOT include usingContainers here.
    // That would activate container mode and require containerSizes.
    const cls = suiTypography({
      usingContainers: [], // safe, does not activate container mode
      fontSize: "18px",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("is recognized by suiSheet() and produces merged classnames", () => {
    const sheet = suiSheet({
      typography: {
        fontSize: "20px",
        fontWeight: 500,
      },
    });

    const className = String(sheet); // SuiSheetReturn is a String object

    expect(typeof className).toBe("string");
    expect(className.length).toBeGreaterThan(0);
  });

  it("produces deterministic classnames for identical input", () => {
    const a = suiTypography({ fontSize: "16px" }).atomize();
    const b = suiTypography({ fontSize: "16px" }).atomize();

    expect(a).toBe(b);
  });

  it("produces different classnames for different input", () => {
    const a = suiTypography({ fontSize: "16px" }).atomize();
    const b = suiTypography({ fontSize: "18px" }).atomize();

    expect(a).not.toBe(b);
  });
});
