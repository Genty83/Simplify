import { describe, it, expect } from "vitest";

import {
  ruleKey,
  sortRulesByState,
} from "../../../core/utils/ruleSorting";
import { statePriority } from "../../../config";

describe("core/utils/ruleSorting", () => {
  /* ==========================================================================
   * ruleKey
   * ======================================================================= */

  describe("ruleKey()", () => {
    it("produces a stable canonical key with all structural fields", () => {
      const rule = {
        namespace: "color",
        property: "color",
        value: "red",
        breakpoint: "@600",
        state: "hover",
      };

      expect(ruleKey(rule as any)).toBe(
        JSON.stringify([
          "color",
          "color",
          "red",
          "@600",
          "hover",
        ]),
      );
    });

    it("normalizes missing optional fields to empty strings", () => {
      const rule = {
        namespace: "layout",
        property: "margin",
        value: 8,
      };

      expect(ruleKey(rule as any)).toBe(
        JSON.stringify([
          "layout",
          "margin",
          8,
          "",
          "",
        ]),
      );
    });

    it("is stable for structurally identical rules", () => {
      const a = {
        namespace: "color",
        property: "color",
        value: "red",
        breakpoint: "@600",
        state: "hover",
      };

      const b = { ...a };

      expect(ruleKey(a as any)).toBe(ruleKey(b as any));
    });
  });

  /* ==========================================================================
   * sortRulesByState
   * ======================================================================= */

  describe("sortRulesByState()", () => {
    it("does not mutate the original array", () => {
      const rules = [
        {
          namespace: "color",
          property: "color",
          value: "red",
          state: "hover",
        },
        {
          namespace: "color",
          property: "color",
          value: "red",
          state: "base",
        },
      ];

      const copy = [...rules];
      sortRulesByState(rules as any);
      expect(rules).toEqual(copy);
    });

    it("sorts by state priority first", () => {
      const basePriority = statePriority.base;
      const hoverPriority = statePriority.hover;

      expect(basePriority).toBeLessThan(hoverPriority);

      const rules = [
        {
          namespace: "color",
          property: "color",
          value: "red",
          state: "hover",
        },
        {
          namespace: "color",
          property: "color",
          value: "red",
          state: "base",
        },
      ];

      const sorted = sortRulesByState(rules as any);

      expect(sorted.map((r) => r.state)).toEqual(["base", "hover"]);
    });

    it("treats missing or unknown states as priority 0", () => {
      const rules = [
        {
          namespace: "color",
          property: "color",
          value: "red",
          state: "hover",
        },
        {
          namespace: "color",
          property: "color",
          value: "red",
          state: undefined,
        },
        {
          namespace: "color",
          property: "color",
          value: "red",
          state: "unknown",
        },
      ];

      const sorted = sortRulesByState(rules as any);

      // unknown + undefined (priority 0) come before hover
      expect(sorted[sorted.length - 1].state).toBe("hover");
    });

    it("uses namespace, property, value, breakpoint as tie‑breakers", () => {
      const rules = [
        {
          namespace: "z",
          property: "color",
          value: "red",
          breakpoint: "@600",
          state: "base",
        },
        {
          namespace: "a",
          property: "color",
          value: "red",
          breakpoint: "@600",
          state: "base",
        },
        {
          namespace: "a",
          property: "backgroundColor",
          value: "red",
          breakpoint: "@600",
          state: "base",
        },
        {
          namespace: "a",
          property: "backgroundColor",
          value: "blue",
          breakpoint: "@400",
          state: "base",
        },
      ];

      const sorted = sortRulesByState(rules as any);

      expect(sorted.map((r) => ({
        namespace: r.namespace,
        property: r.property,
        value: r.value,
        breakpoint: r.breakpoint ?? "",
      }))).toEqual([
        {
          namespace: "a",
          property: "backgroundColor",
          value: "blue",
          breakpoint: "@400",
        },
        {
          namespace: "a",
          property: "backgroundColor",
          value: "red",
          breakpoint: "@600",
        },
        {
          namespace: "a",
          property: "color",
          value: "red",
          breakpoint: "@600",
        },
        {
          namespace: "z",
          property: "color",
          value: "red",
          breakpoint: "@600",
        },
      ]);
    });
  });
});
