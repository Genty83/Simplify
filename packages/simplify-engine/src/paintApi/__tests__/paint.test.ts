import { describe, it, expect } from "vitest";
import { paint, isPaint } from "../../paintApi";
import { mc } from "../../paintApi";

describe("paint()", () => {
  it("wraps a ModeColor token in a PaintValue", () => {
    const token = mc("#fff", "#000", "#f0f");
    const result = paint(token);

    expect(result).toEqual({
      __paint: true,
      token,
      options: undefined,
    });
  });

  it("applies a ThemeMode when passed as a string", () => {
    const token = mc("#fff", "#000", "#f0f");
    const result = paint(token, "dark");

    expect(result.options).toEqual({ mode: "dark" });
  });

  it("applies PaintOptions when passed as an object", () => {
    const token = mc("#fff", "#000", "#f0f");
    const result = paint(token, { mode: "highContrast" });

    expect(result.options).toEqual({ mode: "highContrast" });
  });

  it("does not mutate the original ModeColor token", () => {
    const token = mc("#fff", "#000", "#f0f");
    const copy = { ...token };

    paint(token);

    expect(token).toEqual(copy);
  });
});

describe("paint.with()", () => {
  it("creates a partially applied painter", () => {
    const painter = paint.with({ mode: "dark" });
    const token = mc("#fff", "#000", "#f0f");

    const result = painter(token);

    expect(result).toEqual({
      __paint: true,
      token,
      options: { mode: "dark" },
    });
  });

  it("does not mutate the provided options", () => {
    const opts = { mode: "dark" };
    const painter = paint.with({ mode: "dark" as const });

    painter(mc("#fff", "#000", "#f0f"));

    expect(opts).toEqual({ mode: "dark" });
  });
});

describe("isPaint()", () => {
  it("returns true for valid PaintValue objects", () => {
    const token = mc("#fff", "#000", "#f0f");
    const value = paint(token);

    expect(isPaint(value)).toBe(true);
  });

  it("returns false for non-paint objects", () => {
    expect(isPaint(null)).toBe(false);
    expect(isPaint({})).toBe(false);
    expect(isPaint({ __paint: false })).toBe(false);
    expect(isPaint({ __paint: true })).toBe(false); // missing token
  });

  it("is type-safe with unknown input", () => {
    const input: unknown = paint(mc("#fff", "#000", "#f0f"));
    expect(isPaint(input)).toBe(true);
  });
});
