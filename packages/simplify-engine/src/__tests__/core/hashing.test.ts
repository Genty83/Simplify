import { describe, it, expect, beforeEach } from "vitest";

import {
  setHashSalt,
  hashString,
  hashRuleKey,
  hashRuleKeyLong,
  hashCanonicalRule,
} from "../../core/hashing";

describe("core/hashing", () => {
  beforeEach(() => {
    setHashSalt("");
  });

  describe("hashString()", () => {
    it("produces a deterministic base-36 hash", () => {
      const a = hashString("foo");
      const b = hashString("foo");
      const c = hashString("bar");

      expect(a).toBe(b);
      expect(a).not.toBe(c);
      expect(a).toMatch(/^[0-9a-z]+$/);
    });

    it("normalizes whitespace and trailing decimals before hashing", () => {
      expect(hashString("  foo   bar  ")).toBe(hashString("foo bar"));
      expect(hashString("1.0")).toBe(hashString("1"));
    });

    it("applies salt when set", () => {
      const base = hashString("foo");
      setHashSalt("app");
      const salted = hashString("foo");

      expect(salted).not.toBe(base);
      expect(salted).toMatch(/^[0-9a-z]+$/);
    });
  });

  describe("hashRuleKey()", () => {
    it("prefixes the hash with sui-", () => {
      const result = hashRuleKey("foo");
      expect(result.startsWith("sui-")).toBe(true);
      expect(result.slice(4)).toMatch(/^[0-9a-z]+$/);
    });

    it("is deterministic for identical keys", () => {
      const a = hashRuleKey("margin:12px");
      const b = hashRuleKey("margin:12px");
      const c = hashRuleKey("margin:8px");

      expect(a).toBe(b);
      expect(a).not.toBe(c);
    });
  });

  describe("hashRuleKeyLong()", () => {
    it("normalizes separators and strips unsafe characters", () => {
      const result = hashRuleKeyLong("display:flex");
      expect(result.startsWith("sui-display-flex-")).toBe(true);
    });

    it("is deterministic for identical keys", () => {
      const a = hashRuleKeyLong("margin:12px");
      const b = hashRuleKeyLong("margin:12px");

      expect(a).toBe(b);
    });
  });

  describe("hashCanonicalRule()", () => {
    it("hashes canonical rule objects in fixed field order", () => {
      const ruleA = {
        selector: ".sui-abc",
        property: "margin",
        value: "12px",
        media: "@media (min-width: 640px)",
        state: ":hover",
      };

      const ruleB = {
        selector: ".sui-abc",
        property: "margin",
        value: "12px",
        media: "@media (min-width: 640px)",
        state: ":hover",
      };

      const ruleC = {
        selector: ".sui-abc",
        property: "margin",
        value: "8px",
        media: "@media (min-width: 640px)",
        state: ":hover",
      };

      expect(hashCanonicalRule(ruleA)).toBe(hashCanonicalRule(ruleB));
      expect(hashCanonicalRule(ruleA)).not.toBe(hashCanonicalRule(ruleC));
    });

    it("normalizes missing optional fields to empty strings", () => {
      const withOptional = {
        selector: ".sui-xyz",
        property: "color",
        value: "red",
        media: "@media (min-width: 640px)",
        state: ":hover",
      };

      const withoutOptional = {
        selector: ".sui-xyz",
        property: "color",
        value: "red",
      };

      // different canonical forms → different hashes
      expect(hashCanonicalRule(withOptional)).not.toBe(
        hashCanonicalRule(withoutOptional),
      );
    });
  });
});
