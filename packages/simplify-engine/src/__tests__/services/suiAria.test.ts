import { describe, it, expect, beforeEach } from "vitest";

import { suiAria, ariaLabel, ariaHidden, ariaState } from "../../services";

import { ariaStateMap } from "../../config";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("suiAria.ts – structural ARIA utilities", () => {
  beforeEach(() => {
    // Pure module — no mocks needed
  });

  // -------------------------------------------------------------------------
  // suiAria()
  // -------------------------------------------------------------------------

  describe("suiAria", () => {
    it("emits only explicitly provided keys", () => {
      const out = suiAria({
        role: "button",
        aria: { "aria-label": "Submit" },
      });

      expect(out).toEqual({
        role: "button",
        "aria-label": "Submit",
      });
    });

    it("omits role when undefined", () => {
      const out = suiAria({ aria: { "aria-hidden": true } });

      expect(out).toEqual({
        "aria-hidden": true,
      });
    });

    it("omits aria when undefined", () => {
      const out = suiAria({ role: "checkbox" });

      expect(out).toEqual({
        role: "checkbox",
      });
    });

    it("returns a plain structural object", () => {
      const out = suiAria({ role: "button" });

      expect(Object.getPrototypeOf(out)).toBe(Object.prototype);
    });
  });

  // -------------------------------------------------------------------------
  // ariaLabel()
  // -------------------------------------------------------------------------

  describe("ariaLabel", () => {
    it("emits aria-label", () => {
      expect(ariaLabel("Close")).toEqual({ "aria-label": "Close" });
    });
  });

  // -------------------------------------------------------------------------
  // ariaHidden()
  // -------------------------------------------------------------------------

  describe("ariaHidden", () => {
    it("defaults to true", () => {
      expect(ariaHidden()).toEqual({ "aria-hidden": true });
    });

    it("emits explicit boolean", () => {
      expect(ariaHidden(false)).toEqual({ "aria-hidden": false });
    });
  });

  // -------------------------------------------------------------------------
  // ariaState()
  // -------------------------------------------------------------------------

  describe("ariaState", () => {
    it("emits only keys present in ariaStateMap", () => {
      const out = ariaState({
        ariaDisabled: true,
        ariaExpanded: false,
        foo: true,
      } as any);

      expect(out).toEqual({
        [ariaStateMap.ariaDisabled]: true,
        [ariaStateMap.ariaExpanded]: false,
      });
    });

    it("ignores undefined values", () => {
      const out = ariaState({
        ariaDisabled: undefined,
        ariaExpanded: true,
      });

      expect(out).toEqual({
        [ariaStateMap.ariaExpanded]: true,
      });
    });

    it("returns a structural object", () => {
      const out = ariaState({ ariaDisabled: true });

      expect(Object.getPrototypeOf(out)).toBe(Object.prototype);
    });

    it("emits attributes in deterministic map order", () => {
      const out = ariaState({
        ariaDisabled: true,
        ariaExpanded: false,
        ariaSelected: true,
      });

      const keys = Object.keys(out);

      // Only include keys that were actually emitted
      const expected = Object.values(ariaStateMap).filter(
        (attr) => out[attr] !== undefined,
      );

      expect(keys).toEqual(expected);
    });
  });
});
