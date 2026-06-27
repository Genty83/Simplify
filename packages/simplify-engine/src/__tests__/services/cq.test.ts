import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  isContainerBreakpoint,
  stripPrefix,
  parseContainerQuery,
  wrapInContainer,
  mapTupleToContainerSizes,
} from "../../services/cq";

import type { AnyContainerBreakpoint, ContainerSizeMap } from "../../types";

import { containerSizeMap } from "../../config";
import { resolveContainerDSL } from "../../core/utils/containerDSL";
import { LEGACY_PARSERS } from "../../core/utils/containerLegacy";

// ---------------------------------------------------------------------------
// Mocks for DSL + legacy parsers
// ---------------------------------------------------------------------------

vi.mock("../../core/utils/containerDSL", () => ({
  resolveContainerDSL: vi.fn(),
}));

vi.mock("../../core/utils/containerLegacy", () => ({
  LEGACY_PARSERS: [
    vi.fn(),
    vi.fn(),
  ],
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("cq.ts – container query services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // isContainerBreakpoint
  // -------------------------------------------------------------------------

  describe("isContainerBreakpoint", () => {
    it("detects @container prefix", () => {
      expect(isContainerBreakpoint("@container:small")).toBe(true);
      expect(isContainerBreakpoint("@container:width:300")).toBe(true);
    });

    it("detects @containerDSL prefix", () => {
      expect(isContainerBreakpoint("@containerDSL:card")).toBe(true);
    });

    it("rejects non-container keys", () => {
      expect(isContainerBreakpoint("mobile")).toBe(false);
      expect(isContainerBreakpoint("@600")).toBe(false);
      expect(isContainerBreakpoint("container:small")).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // stripPrefix
  // -------------------------------------------------------------------------

  describe("stripPrefix", () => {
    it("removes @container: prefix", () => {
      expect(stripPrefix("@container:small")).toBe("small");
      expect(stripPrefix("@container:width:300")).toBe("width:300");
    });

    it("removes @container prefix without colon", () => {
      expect(stripPrefix("@containerwidth:300")).toBe("width:300");
    });

    it("returns key unchanged when no prefix exists", () => {
      expect(stripPrefix("small")).toBe("small");
    });
  });

  // -------------------------------------------------------------------------
  // parseContainerQuery
  // -------------------------------------------------------------------------

  describe("parseContainerQuery", () => {
    it("resolves DSL keys first", () => {
      (resolveContainerDSL as any).mockReturnValue("(min-width: 300px)");

      const result = parseContainerQuery(
        "@containerDSL:card" as AnyContainerBreakpoint
      );

      expect(result).toBe("@container (min-width: 300px)");
      expect(resolveContainerDSL).toHaveBeenCalled();
    });

    it("resolves legacy parsers when DSL returns null", () => {
      (resolveContainerDSL as any).mockReturnValue(null);

      (LEGACY_PARSERS[0] as any).mockReturnValue("(width > 300px)");
      (LEGACY_PARSERS[1] as any).mockReturnValue(null);

      const result = parseContainerQuery(
        "@container:width:300" as AnyContainerBreakpoint
      );

      expect(result).toBe("(width > 300px)");
    });

    it("throws on invalid syntax", () => {
      (resolveContainerDSL as any).mockReturnValue(null);
      (LEGACY_PARSERS[0] as any).mockReturnValue(null);
      (LEGACY_PARSERS[1] as any).mockReturnValue(null);

      expect(() =>
        parseContainerQuery("@container:unknown" as AnyContainerBreakpoint)
      ).toThrow("Invalid container query syntax");
    });

    it("uses provided container size map for named sizes", () => {
      (resolveContainerDSL as any).mockReturnValue(null);

      (LEGACY_PARSERS[0] as any).mockImplementation(
        (raw: string, sizes: ContainerSizeMap) => {
          if (raw === "small") return `(min-width: ${sizes.small})`;
          return null;
        }
      );

      const sizes: ContainerSizeMap = { small: "300px" };

      const result = parseContainerQuery(
        "@container:small" as AnyContainerBreakpoint,
        sizes
      );

      expect(result).toBe("(min-width: 300px)");
    });
  });

  // -------------------------------------------------------------------------
  // wrapInContainer
  // -------------------------------------------------------------------------

  describe("wrapInContainer", () => {
    it("wraps CSS in a @container rule", () => {
      const css = wrapInContainer("(min-width: 300px)", ".x{color:red}");

      expect(css).toBe("@container (min-width: 300px) { .x{color:red} }");
    });
  });

  // -------------------------------------------------------------------------
  // mapTupleToContainerSizes
  // -------------------------------------------------------------------------

  describe("mapTupleToContainerSizes", () => {
    it("maps tuple values to size keys", () => {
      const tuple = ["100px", "200px"] as const;
      const keys = ["small", "medium"] as const;

      const result = mapTupleToContainerSizes(tuple, keys);

      expect(result).toEqual({
        small: "100px",
        medium: "200px",
        default: "100px",
      });
    });

    it("skips undefined tuple entries", () => {
      const tuple = ["100px"] as const;
      const keys = ["small", "medium"] as const;

      const result = mapTupleToContainerSizes(tuple, keys);

      expect(result).toEqual({
        small: "100px",
        default: "100px",
      });
    });

    it("does not set default when first key is missing", () => {
      const tuple = [undefined, "200px"] as const;
      const keys = ["small", "medium"] as const;

      const result = mapTupleToContainerSizes(tuple, keys);

      expect(result).toEqual({
        medium: "200px",
      });
    });
  });
});
