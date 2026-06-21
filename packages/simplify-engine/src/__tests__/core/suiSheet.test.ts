import { describe, it, expect, beforeEach, vi } from "vitest";
import { suiSheet } from "../../core/suiSheet";

// Mock wrapInLayer so we can assert calls
vi.mock("../../core/stylesheet", () => ({
  wrapInLayer: vi.fn(),
}));

import { wrapInLayer } from "../../core/stylesheet";

// Real registry API
import {
  registerUtility,
  getRegisteredUtilities,
} from "../../utilities/utilityRegistry";

import type { AnyContainerBreakpoint } from "../../types";

// Minimal valid UtilityResult
function fakeUtility(atom: string) {
  return {
    __utility: true as true,
    rules: [],
    atomize: () => atom,
  };
}

describe("suiSheet()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ==========================================================================
   * basic behaviour
   * ======================================================================= */

  it("returns merged classnames from all registered utilities", () => {
    registerUtility("gap", () => fakeUtility("sui-gap"));
    registerUtility("pad", () => fakeUtility("sui-pad"));

    const sheet = suiSheet({
      gap: { size: 12 },
      pad: { size: 4 },
    });

    expect(String(sheet)).toBe("sui-gap sui-pad");
  });

  it("preserves utility registration order", () => {
    registerUtility("a", () => fakeUtility("x"));
    registerUtility("b", () => fakeUtility("y"));
    registerUtility("c", () => fakeUtility("z"));

    const sheet = suiSheet({ a: {}, b: {}, c: {} });

    expect(String(sheet)).toBe("x y z");
  });

  it("skips utilities not present in the sheet config", () => {
    registerUtility("a", () => fakeUtility("x"));
    registerUtility("b", () => fakeUtility("y"));

    const sheet = suiSheet({ a: {} });

    expect(String(sheet)).toBe("x");
  });

  /* ==========================================================================
   * sheet-level context passing
   * ======================================================================= */

  it("passes breakpoints, container sizes, container mode, and usingContainers to utilities", () => {
    let received: any = null;

    registerUtility("layout", (config: any) => {
      received = config;
      return fakeUtility("sui-layout");
    });

    const sheet = suiSheet({
      layout: {
        usingContainers: [
          "mobile",
          "wide",
        ] as unknown as AnyContainerBreakpoint[],
      },
      usingBreakpoints: ["mobile", "desktop"],
      containerSizes: { mobile: "300px", desktop: "900px" },
      isContainerChild: true,
    });

    expect(received.usingBreakpoints).toEqual(["mobile", "desktop"]);
    expect(received.usingContainers).toEqual(["mobile", "wide"]);
    expect(received.__containerMode).toBe(true);
    expect(received.__containerSizes).toEqual({
      mobile: "300px",
      desktop: "900px",
    });

    expect(String(sheet)).toBe("sui-layout");
  });

  /* ==========================================================================
   * .asLayer()
   * ======================================================================= */

  it("exposes a working .asLayer() API", () => {
    registerUtility("gap", () => fakeUtility("sui-gap"));

    const sheet = suiSheet({ gap: {} });

    const result = sheet.asLayer("theme");

    expect(result).toBe("sui-gap");
    expect(wrapInLayer).toHaveBeenCalledTimes(1);
    expect(wrapInLayer).toHaveBeenCalledWith("sui-gap", "theme");
  });

  it(".asLayer() does not mutate the underlying classname", () => {
    registerUtility("gap", () => fakeUtility("sui-gap"));

    const sheet = suiSheet({ gap: {} });

    sheet.asLayer("theme");

    expect(String(sheet)).toBe("sui-gap");
  });

  /* ==========================================================================
   * determinism
   * ======================================================================= */

  it("is deterministic for identical configs", () => {
    registerUtility("gap", () => fakeUtility("sui-gap"));

    const a = String(suiSheet({ gap: {} }));
    const b = String(suiSheet({ gap: {} }));

    expect(a).toBe(b);
  });

  /* ==========================================================================
   * type guards
   * ======================================================================= */

  it("ignores non-record utility configs", () => {
    registerUtility("gap", () => fakeUtility("sui-gap"));

    const sheet = suiSheet({ gap: 123 });

    expect(String(sheet)).toBe("");
  });

  it("ignores non-array usingContainers", () => {
    let received: any = null;

    registerUtility("layout", (config: any) => {
      received = config;
      return fakeUtility("sui-layout");
    });

    // @ts-expect-error intentional bad input
    suiSheet({ layout: { usingContainers: 123 } });

    expect(received.usingContainers).toEqual([]);
  });
});
