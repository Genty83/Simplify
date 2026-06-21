import { describe, it, expect, beforeEach } from "vitest";

import {
  parseContainerDSL,
  hashContainerDSL,
  resolveContainerDSL,
  cq,
} from "../../../core/utils/containerDSL";

import {
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  orientation,
} from "../../../core/utils/containerConditions";

describe("core/utils/containerDSL", () => {
  beforeEach(() => {
    // Reset DSL registry by forcing a fresh module instance
    // (cq() only writes to internal registry)
    // Easiest way: call cq() with a unique key to avoid collisions
    cq({ minWidth: 1 });
  });

  /* ==========================================================================
   * parseContainerDSL
   * ======================================================================= */

  describe("parseContainerDSL()", () => {
    it("parses minWidth", () => {
      expect(parseContainerDSL({ minWidth: 300 })).toBe("(min-width: 300px)");
    });

    it("parses multiple fields in deterministic order", () => {
      const dsl = {
        minWidth: 300,
        orientation: "portrait" as const,
        maxHeight: 800,
      };

      expect(parseContainerDSL(dsl)).toBe(
        [minWidth(300), maxHeight(800), orientation("portrait")].join(" and "),
      );
    });

    it("throws when DSL is empty", () => {
      expect(() => parseContainerDSL({} as any)).toThrow(
        /must specify at least one condition/,
      );
    });
  });

  /* ==========================================================================
   * hashContainerDSL
   * ======================================================================= */

  describe("hashContainerDSL()", () => {
    it("produces deterministic hashes", () => {
      const dsl = { minWidth: 300, maxHeight: 800 };
      const h1 = hashContainerDSL(dsl);
      const h2 = hashContainerDSL(dsl);
      expect(h1).toBe(h2);
    });

    it("is independent of key order", () => {
      const a = { minWidth: 300, maxHeight: 800 };
      const b = { maxHeight: 800, minWidth: 300 };

      expect(hashContainerDSL(a)).toBe(hashContainerDSL(b));
    });

    it("produces a prefixed hex hash", () => {
      const key = hashContainerDSL({ minWidth: 100 });
      expect(key.startsWith("@containerDSL:")).toBe(true);
      expect(/^[0-9a-f]+$/i.test(key.replace("@containerDSL:", ""))).toBe(true);
    });
  });

  /* ==========================================================================
   * resolveContainerDSL
   * ======================================================================= */

  describe("resolveContainerDSL()", () => {
    it("returns null for non-DSL keys", () => {
      expect(resolveContainerDSL("@container (min-width: 300px)" as any)).toBe(
        null,
      );
      expect(resolveContainerDSL("foo" as any)).toBe(null);
    });

    it("returns null for unknown DSL hashes", () => {
      expect(resolveContainerDSL("@containerDSL:deadbeef" as any)).toBe(null);
    });

    it("returns parsed DSL for known keys", () => {
      const key = cq({ minWidth: 300 });
      expect(resolveContainerDSL(key)).toBe("(min-width: 300px)");
    });
  });

  /* ==========================================================================
   * cq()
   * ======================================================================= */

  describe("cq()", () => {
    it("returns a stable hashed key", () => {
      const key1 = cq({ minWidth: 300 });
      const key2 = cq({ minWidth: 300 });
      expect(key1).toBe(key2);
    });

    it("stores parsed DSL in registry", () => {
      const key = cq({ maxHeight: 500 });
      expect(resolveContainerDSL(key)).toBe("(max-height: 500px)");
    });

    it("parses DSL only once (registry caching)", () => {
      const dsl = { minWidth: 300 };

      const key = cq(dsl);
      const first = resolveContainerDSL(key);

      // Mutate DSL to test caching — should NOT affect result
      dsl.minWidth = 999;

      const second = resolveContainerDSL(key);

      expect(first).toBe(second);
      expect(second).toBe("(min-width: 300px)");
    });

    it("supports all DSL fields", () => {
      const key = cq({
        minWidth: 100,
        maxWidth: 500,
        minHeight: 200,
        maxHeight: 800,
        orientation: "landscape",
      });

      expect(resolveContainerDSL(key)).toBe(
        [
          minWidth(100),
          maxWidth(500),
          minHeight(200),
          maxHeight(800),
          orientation("landscape"),
        ].join(" and "),
      );
    });
  });
});
