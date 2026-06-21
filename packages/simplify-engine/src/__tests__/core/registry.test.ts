import { describe, it, expect, beforeEach } from "vitest";

import {
  hasRule,
  hasCanonicalRule,
  registerRule,
  getRule,
  getAllRules,
  deleteRule,
  clearRegistry,
  getRuleCount,
  serializeRules,
} from "../../core/registry";

describe("core/registry", () => {
  beforeEach(() => {
    clearRegistry();
  });

  /* ==========================================================================
   * hasRule()
   * ======================================================================= */

  describe("hasRule()", () => {
    it("returns false when rule does not exist", () => {
      expect(hasRule("abc")).toBe(false);
    });

    it("returns true when rule exists", () => {
      registerRule("abc", "color:red;");
      expect(hasRule("abc")).toBe(true);
    });
  });

  /* ==========================================================================
   * hasCanonicalRule()
   * ======================================================================= */

  describe("hasCanonicalRule()", () => {
    it("returns false when canonical hash does not exist", () => {
      expect(hasCanonicalRule("canon-1")).toBe(false);
    });

    it("returns true when canonical hash exists", () => {
      registerRule("abc", "color:red;", "canon-1");
      expect(hasCanonicalRule("canon-1")).toBe(true);
    });

    it("increments count for duplicate canonical hashes", () => {
      registerRule("a", "x", "canon-1");
      registerRule("b", "y", "canon-1");
      expect(hasCanonicalRule("canon-1")).toBe(true);
    });
  });

  /* ==========================================================================
   * registerRule()
   * ======================================================================= */

  describe("registerRule()", () => {
    it("stores a rule with its CSS", () => {
      registerRule("abc", "color:red;");
      expect(getRule("abc")).toBe("color:red;");
    });

    it("overwrites existing rules with the same hash", () => {
      registerRule("abc", "color:red;");
      registerRule("abc", "color:blue;");
      expect(getRule("abc")).toBe("color:blue;");
    });

    it("tracks canonical hashes independently", () => {
      registerRule("a", "x", "canon-1");
      registerRule("b", "y", "canon-1");
      expect(hasCanonicalRule("canon-1")).toBe(true);
    });
  });

  /* ==========================================================================
   * getRule()
   * ======================================================================= */

  describe("getRule()", () => {
    it("returns undefined for missing rules", () => {
      expect(getRule("missing")).toBeUndefined();
    });

    it("returns only the CSS string", () => {
      registerRule("abc", "color:red;", "canon-1", {
        selector: ".x",
        property: "color",
        value: "red",
      });

      expect(getRule("abc")).toBe("color:red;");
    });
  });

  /* ==========================================================================
   * getAllRules()
   * ======================================================================= */

  describe("getAllRules()", () => {
    it("returns a snapshot copy, not the internal map", () => {
      registerRule("a", "x");
      const snapshot = getAllRules() as Map<string, any>;

      registerRule("b", "y");

      expect(snapshot.size).toBe(1);
      expect(getAllRules().size).toBe(2);
    });

    it("preserves insertion order", () => {
      registerRule("a", "x");
      registerRule("b", "y");
      registerRule("c", "z");

      const keys = Array.from(getAllRules().keys());
      expect(keys).toEqual(["a", "b", "c"]);
    });
  });

  /* ==========================================================================
   * deleteRule()
   * ======================================================================= */

  describe("deleteRule()", () => {
    it("removes a rule from the registry", () => {
      registerRule("abc", "color:red;");
      deleteRule("abc");
      expect(hasRule("abc")).toBe(false);
    });

    it("decrements canonical hash count and removes when zero", () => {
      registerRule("a", "x", "canon-1");
      registerRule("b", "y", "canon-1");

      deleteRule("a");
      expect(hasCanonicalRule("canon-1")).toBe(true);

      deleteRule("b");
      expect(hasCanonicalRule("canon-1")).toBe(false);
    });
  });

  /* ==========================================================================
   * clearRegistry()
   * ======================================================================= */

  describe("clearRegistry()", () => {
    it("clears both registries", () => {
      registerRule("a", "x", "canon-1");
      registerRule("b", "y", "canon-2");

      clearRegistry();

      expect(getRuleCount()).toBe(0);
      expect(hasCanonicalRule("canon-1")).toBe(false);
      expect(hasCanonicalRule("canon-2")).toBe(false);
    });
  });

  /* ==========================================================================
   * getRuleCount()
   * ======================================================================= */

  describe("getRuleCount()", () => {
    it("returns the number of registered rules", () => {
      expect(getRuleCount()).toBe(0);
      registerRule("a", "x");
      registerRule("b", "y");
      expect(getRuleCount()).toBe(2);
    });
  });

  /* ==========================================================================
   * serializeRules()
   * ======================================================================= */

  describe("serializeRules()", () => {
    it("serializes rules in insertion order with newlines", () => {
      registerRule("a", "x");
      registerRule("b", "y");
      registerRule("c", "z");

      const { css, count } = serializeRules();

      expect(css).toBe("x\ny\nz\n");
      expect(count).toBe(3);
    });

    it("serializes an empty registry", () => {
      const { css, count } = serializeRules();
      expect(css).toBe("");
      expect(count).toBe(0);
    });
  });
});
