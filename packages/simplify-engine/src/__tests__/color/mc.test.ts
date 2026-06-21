import { describe, it, expect } from "vitest";
import { mc } from "../../color";

describe("mc()", () => {
  it("creates a fully rectangular ModeColor object", () => {
    const result = mc("#fff", "#000", "#ff00ff");

    expect(result).toEqual({
      light: "#fff",
      dark: "#000",
      highContrast: "#ff00ff",
    });
  });

  it("preserves values exactly with no transformation", () => {
    const light = "hsl(200, 50%, 40%)";
    const dark = "rgb(10, 20, 30)";
    const hc = "#abcdef";

    const result = mc(light, dark, hc);

    expect(result.light).toBe(light);
    expect(result.dark).toBe(dark);
    expect(result.highContrast).toBe(hc);
  });

  it("does not mutate input values", () => {
    const light = "#111";
    const dark = "#222";
    const hc = "#333";

    const result = mc(light, dark, hc);

    // Ensure the returned object is not the same reference as any input
    expect(result).not.toBe(light);
    expect(result).not.toBe(dark);
    expect(result).not.toBe(hc);
  });

  it("always returns all required modes", () => {
    const result = mc("a", "b", "c");

    expect(Object.keys(result).sort()).toEqual(
      ["light", "dark", "highContrast"].sort()
    );
  });
});
