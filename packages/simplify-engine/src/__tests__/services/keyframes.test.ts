import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

import { stepToCSS, keyframes } from "../../services/keyframes";

import {
  hashRuleKey,
  hasRule,
  registerRule,
  injectCSS,
  toKebab,
} from "../../core";

import type {
  KeyframeStep,
  KeyframesDefinition,
  KeyframesResult,
} from "../../types";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../core", () => ({
  hashRuleKey: vi.fn(),
  hasRule: vi.fn(),
  registerRule: vi.fn(),
  injectCSS: vi.fn(),
  toKebab: vi.fn((prop: string) =>
    prop.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()),
  ),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("keyframes.ts – keyframe generation utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Restore default kebab-case behavior for all tests
    (toKebab as any).mockImplementation((prop: string) =>
      prop.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()),
    );
  });

  // -------------------------------------------------------------------------
  // stepToCSS
  // -------------------------------------------------------------------------

  describe("stepToCSS", () => {
    it("converts a keyframe step into a CSS declaration block", () => {
      const step: KeyframeStep = {
        opacity: 0,
        transform: "scale(0.9)",
      };

      const css = stepToCSS(step);

      expect(css).toBe("opacity: 0 transform: scale(0.9)");
    });

    it("applies kebab-case conversion via toKebab()", () => {
      (toKebab as any).mockImplementation((prop: string) => prop.toUpperCase());

      const step: KeyframeStep = { backgroundColor: "red" };

      const css = stepToCSS(step);

      expect(css).toBe("BACKGROUNDCOLOR: red");
      expect(toKebab).toHaveBeenCalledWith("backgroundColor");
    });
  });

  // -------------------------------------------------------------------------
  // keyframes()
  // -------------------------------------------------------------------------

  describe("keyframes", () => {
    it("generates a deterministic keyframe name using hashRuleKey()", () => {
      (hashRuleKey as any).mockReturnValue("abc123");
      (hasRule as any).mockReturnValue(false);

      const def: KeyframesDefinition = {
        "0%": { opacity: 0 },
        "100%": { opacity: 1 },
      };

      const result = keyframes(def);

      expect(result).toEqual({
        __keyframes: true,
        name: "kf-abc123",
      });

      expect(hashRuleKey).toHaveBeenCalledWith(JSON.stringify(def));
    });

    it("injects CSS only when rule has not been registered", () => {
      (hashRuleKey as any).mockReturnValue("xyz999");
      (hasRule as any).mockReturnValue(false);

      const def: KeyframesDefinition = {
        "0%": { opacity: 0 },
        "100%": { opacity: 1 },
      };

      const result = keyframes(def);

      expect(registerRule).toHaveBeenCalledTimes(1);
      expect(injectCSS).toHaveBeenCalledTimes(1);

      const css = (injectCSS as Mock).mock.calls[0][0];

      expect(css).toContain("@keyframes kf-xyz999");
      expect(css).toContain("0%: opacity: 0");
      expect(css).toContain("100%: opacity: 1");

      expect(result.name).toBe("kf-xyz999");
    });

    it("does NOT inject CSS when rule already exists", () => {
      (hashRuleKey as any).mockReturnValue("dup111");
      (hasRule as any).mockReturnValue(true);

      const def: KeyframesDefinition = {
        "0%": { opacity: 0 },
      };

      const result = keyframes(def);

      expect(registerRule).not.toHaveBeenCalled();
      expect(injectCSS).not.toHaveBeenCalled();

      expect(result.name).toBe("kf-dup111");
    });

    it("produces identical names for identical definitions", () => {
      (hashRuleKey as any).mockReturnValue("samehash");
      (hasRule as any).mockReturnValue(false);

      const def1: KeyframesDefinition = {
        "0%": { opacity: 0 },
      };

      const def2: KeyframesDefinition = {
        "0%": { opacity: 0 },
      };

      const r1 = keyframes(def1);
      const r2 = keyframes(def2);

      expect(r1.name).toBe("kf-samehash");
      expect(r2.name).toBe("kf-samehash");
    });

    it("produces different names for different definitions", () => {
      (hashRuleKey as any)
        .mockReturnValueOnce("hashA")
        .mockReturnValueOnce("hashB");

      (hasRule as any).mockReturnValue(false);

      const r1 = keyframes({ "0%": { opacity: 0 } });
      const r2 = keyframes({ "0%": { opacity: 1 } });

      expect(r1.name).toBe("kf-hashA");
      expect(r2.name).toBe("kf-hashB");
    });
  });
});
