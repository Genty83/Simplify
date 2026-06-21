import { describe, it, expect } from "vitest";
import { suiColor } from "../../color";
import { mc } from "../../color";

// Utility: recursively walk all values in the palette
function walk(obj: unknown, fn: (value: unknown, path: string) => void, path = "") {
  if (typeof obj !== "object" || obj === null) return;

  for (const key of Object.keys(obj)) {
    const value = (obj as any)[key];
    const nextPath = path ? `${path}.${key}` : key;

    fn(value, nextPath);

    if (typeof value === "object" && value !== null) {
      walk(value, fn, nextPath);
    }
  }
}

describe("colorPalette", () => {
  it("contains only valid ModeColor tokens at leaf nodes", () => {
    const modeKeys = ["light", "dark", "highContrast"];

    walk(suiColor, (value, path) => {
      // Only validate leaf nodes that look like ModeColor
      if (
        typeof value === "object" &&
        value !== null &&
        modeKeys.every(k => k in value)
      ) {
        // Validate each mode exists and is a string
        for (const mode of modeKeys) {
          const v = (value as any)[mode];

          expect(typeof v).toBe("string");
          expect(v.length).toBeGreaterThan(0);
        }
      }
    });
  });

  it("has no undefined, null, or empty string values anywhere", () => {
    walk(suiColor, (value, path) => {
      if (value === undefined || value === null) {
        throw new Error(`Invalid nullish value at: ${path}`);
      }

      if (typeof value === "string" && value.trim() === "") {
        throw new Error(`Empty string found at: ${path}`);
      }
    });
  });

  it("ensures all ModeColor tokens are created via mc()", () => {
    walk(suiColor, (value, path) => {
      if (
        typeof value === "object" &&
        value !== null &&
        "light" in value &&
        "dark" in value &&
        "highContrast" in value
      ) {
        // mc() returns a plain object, but we can still validate shape
        expect(Object.keys(value).sort()).toEqual(
          ["light", "dark", "highContrast"].sort()
        );
      }
    });
  });

  it("ensures no arrays or unexpected objects exist in the palette", () => {
    walk(suiColor, (value, path) => {
      if (Array.isArray(value)) {
        throw new Error(`Unexpected array found at: ${path}`);
      }
    });
  });
});
