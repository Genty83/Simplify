import { describe, it, expect, beforeEach } from "vitest";
import {
  setThemeMode,
  getThemeMode,
  resolvePaint,
} from "../../color";
import { mc } from "../../color";

describe("paintEngine", () => {
  beforeEach(() => {
    // Reset global mode before each test for determinism
    setThemeMode("light");
  });

  describe("setThemeMode() / getThemeMode()", () => {
    it("sets and retrieves the global theme mode", () => {
      setThemeMode("dark");
      expect(getThemeMode()).toBe("dark");

      setThemeMode("highContrast");
      expect(getThemeMode()).toBe("highContrast");
    });
  });

  describe("resolvePaint()", () => {
    it("resolves using the global mode when no override is provided", () => {
      const token = mc("L", "D", "HC");

      setThemeMode("dark");
      expect(resolvePaint(token)).toBe("D");

      setThemeMode("highContrast");
      expect(resolvePaint(token)).toBe("HC");
    });

    it("resolves using an explicit override mode", () => {
      const token = mc("L", "D", "HC");

      setThemeMode("light");
      expect(resolvePaint(token, { mode: "dark" })).toBe("D");

      setThemeMode("dark");
      expect(resolvePaint(token, { mode: "highContrast" })).toBe("HC");
    });

    it("falls back to light → dark → highContrast → #000000", () => {
      const token = {
        light: undefined,
        dark: undefined,
        highContrast: undefined,
      } as any;

      expect(resolvePaint(token)).toBe("#000000");
    });

    it("uses the correct fallback order when some modes are missing", () => {
      const token1 = { light: "L" } as any;
      expect(resolvePaint(token1)).toBe("L");

      const token2 = { dark: "D" } as any;
      expect(resolvePaint(token2)).toBe("D");

      const token3 = { highContrast: "HC" } as any;
      expect(resolvePaint(token3)).toBe("HC");
    });

    it("does not mutate the ModeColor token", () => {
      const token = mc("L", "D", "HC");
      const copy = { ...token };

      resolvePaint(token);

      expect(token).toEqual(copy);
    });
  });
});
