import { describe, it, expect } from "vitest";
import { sui } from "../../core/sui";

describe("sui()", () => {
  /* ==========================================================================
   * raw class names
   * ======================================================================= */

  it("composes raw class names in order", () => {
    expect(sui("a", "b", "c")).toBe("a b c");
  });

  /* ==========================================================================
   * falsy handling
   * ======================================================================= */

  it("skips falsy values", () => {
    expect(sui("a", false, null, undefined, "", "b")).toBe("a b");
  });

  /* ==========================================================================
   * conditional classes
   * ======================================================================= */

  it("supports conditional class names", () => {
    const active = true;
    const inactive = false;

    expect(sui("btn", active && "btn-active")).toBe("btn btn-active");
    expect(sui("btn", inactive && "btn-active")).toBe("btn");
  });

  /* ==========================================================================
   * utility objects
   * ======================================================================= */

  it("atomizes utility objects", () => {
    const util = {
      __utility: true,
      atomize: () => "sui-abc123",
    } as const;

    expect(sui("grid", util)).toBe("grid sui-abc123");
  });

  it("ignores objects that are not utilities", () => {
    expect(sui("a", { foo: "bar" } as any)).toBe("a [object Object]");
  });

  /* ==========================================================================
   * mixed inputs
   * ======================================================================= */

  it("handles mixed raw, conditional, utility, and falsy inputs", () => {
    const util = {
      __utility: true,
      atomize: () => "sui-abc123",
    } as const;

    expect(sui("p-4", false, null, undefined, util, "rounded")).toBe(
      "p-4 sui-abc123 rounded",
    );
  });

  /* ==========================================================================
   * determinism
   * ======================================================================= */

  it("is deterministic for identical inputs", () => {
    const util = {
      __utility: true,
      atomize: () => "sui-abc123",
    } as const;

    const a = sui("x", util, "y");
    const b = sui("x", util, "y");

    expect(a).toBe(b);
  });
});
