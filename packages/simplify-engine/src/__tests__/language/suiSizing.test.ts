import { describe, it, expect } from "vitest";

import { suiSizing } from "../../language/suiSizing";
import { rs, states } from "../../services";
import { suiSheet } from "../../core";

describe("suiSizing – SimplifyUI sizing utility", () => {

  it("has the correct function name", () => {
    // createSuiUtility() always produces a function literally named "utility"
    expect(suiSizing.name).toBe("utility");
  });

  it("produces atomic rules via .atomize()", () => {
    const cls = suiSizing({
      width: "100%",
      height: "200px",
      maxWidth: "80vw",
    }).atomize();

    expect(typeof cls).toBe("string");
    expect(cls.length).toBeGreaterThan(0);
  });

  it("supports logical sizing properties", () => {
    const cls = suiSizing({
      inlineSize: "50%",
      blockSize: "300px",
      minInlineSize: "200px",
      maxBlockSize: "600px",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports aspect ratio", () => {
    const cls = suiSizing({
      aspectRatio: "16 / 9",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports object sizing", () => {
    const cls = suiSizing({
      objectFit: "cover",
      objectPosition: "center",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports overflow properties", () => {
    const cls = suiSizing({
      overflow: "hidden",
      overflowX: "scroll",
      overflowY: "auto",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports responsive values via rs()", () => {
    const cls = suiSizing({
      width: rs({
        mobile: "100%",
        tablet: "480px",
      }),
      usingBreakpoints: ["mobile", "tablet"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports state wrappers via states()", () => {
    const cls = suiSizing({
      width: states({ hover: "120%" }),
      height: states({ pressed: "240px" as any }),
      usingStates: ["hover", "pressed"],
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("supports shorthand `size`", () => {
    const cls = suiSizing({
      size: "48px",
    }).atomize();

    expect(typeof cls).toBe("string");
  });

  it("is recognized by suiSheet() and produces merged classnames", () => {
    const sheet = suiSheet({
      sizing: {
        width: "100%",
        height: "240px",
      },
    });

    const className = String(sheet); // SuiSheetReturn is a String object

    expect(typeof className).toBe("string");
    expect(className.length).toBeGreaterThan(0);
  });

  it("produces deterministic classnames for identical input", () => {
    const a = suiSizing({ width: "100%" }).atomize();
    const b = suiSizing({ width: "100%" }).atomize();

    expect(a).toBe(b);
  });

  it("produces different classnames for different input", () => {
    const a = suiSizing({ width: "100%" }).atomize();
    const b = suiSizing({ width: "50%" }).atomize();

    expect(a).not.toBe(b);
  });
});
