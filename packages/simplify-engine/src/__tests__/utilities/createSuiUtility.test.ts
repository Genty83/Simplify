import { describe, it, expect, vi, beforeEach } from "vitest";

import { createSuiUtility } from "../../utilities/createSuiUtility";

import {
  breakpoints,
  type AnyBreakpoint,
  type AnyContainerBreakpoint,
  type ContainerSizeMap,
  type UtilityResult,
} from "../../types";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../services", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, any>;
  return {
    ...actual,
    autoRs: vi.fn(),
  };
});

vi.mock("../../utilities/createUtility", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, any>;
  return {
    ...actual,
    createUtility: vi.fn(),
  };
});

import { autoRs } from "../../services";
import { createUtility } from "../../utilities/createUtility";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const defaultBreakpoints: AnyBreakpoint[] = [...breakpoints];

const defaultContainers: AnyContainerBreakpoint[] = [];

const containerSizes: ContainerSizeMap = {
  small: "300px",
  medium: "600px",
};

// ---------------------------------------------------------------------------
// Test utility factory
// ---------------------------------------------------------------------------

function mockCompiler(
  result: Partial<UtilityResult> = {},
): (config: any) => UtilityResult {
  return vi.fn((config: any) => ({
    __utility: true,
    rules: [],
    atomize: () => "",
    ...result,
    __config: config,
  })) as any;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("createSuiUtility – meta + mapping + normalization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses default breakpoint graph and forwards meta when none provided", () => {
    const compiler = mockCompiler();
    (createUtility as any).mockReturnValue(compiler);
    (autoRs as any).mockImplementation((value: unknown) => value);

    const layout = createSuiUtility("layout");
    const result = layout({ margin: 10 } as any) as any;

    expect(createUtility).toHaveBeenCalledWith("layout");
    expect(compiler).toHaveBeenCalledTimes(1);

    const config = result.__config;

    expect(config.margin).toBe(10);
    expect(config.usingBreakpoints).toEqual(defaultBreakpoints);
    expect(config.usingContainers).toEqual(defaultContainers);
    expect(config.__containerMode).toBe(false);
    expect(config.__containerSizes).toBeNull();
  });

  it("respects explicit usingBreakpoints and usingContainers", () => {
    const compiler = mockCompiler();
    (createUtility as any).mockReturnValue(compiler);
    (autoRs as any).mockImplementation((value: unknown) => value);

    const layout = createSuiUtility("layout");
    const result = layout({
      margin: 10,
      usingBreakpoints: ["mobile", "@600"],
      usingContainers: ["@container:small"],
    } as any) as any;

    const config = result.__config;

    expect(config.usingBreakpoints).toEqual(["mobile", "@600"]);
    expect(config.usingContainers).toEqual(["@container:small"]);
  });

  it("enables containerMode and normalizes containerSizes when valid", () => {
    const compiler = mockCompiler();
    (createUtility as any).mockReturnValue(compiler);
    (autoRs as any).mockImplementation((value: unknown) => value);

    const sheet = createSuiUtility("surface");
    const result = sheet({
      padding: 16,
      __containerMode: true,
      __containerSizes: containerSizes,
    } as any) as any;

    const config = result.__config;

    expect(config.__containerMode).toBe(true);
    expect(config.__containerSizes).toEqual(containerSizes);
  });

  it("falls back to containerSizes=null when sizes are not a plain string map", () => {
    const compiler = mockCompiler();
    (createUtility as any).mockReturnValue(compiler);
    (autoRs as any).mockImplementation((value: unknown) => value);

    const sheet = createSuiUtility("surface");
    const result = sheet({
      padding: 16,
      __containerMode: true,
      __containerSizes: { small: 300 } as any,
    } as any) as any;

    const config = result.__config;

    expect(config.__containerMode).toBe(true);
    expect(config.__containerSizes).toBeNull();
  });

  it("applies semantic → CSS property mapping when propMap is provided", () => {
    const compiler = mockCompiler();
    (createUtility as any).mockReturnValue(compiler);
    (autoRs as any).mockImplementation((value: unknown) => value);

    const layout = createSuiUtility("layout", {
      gap: "rowGap",
      align: "alignItems",
    });

    const result = layout({
      gap: 8,
      align: "center",
    } as any) as any;

    const config = result.__config;

    expect(config.rowGap).toBe(8);
    expect(config.alignItems).toBe("center");
    expect(config.gap).toBeUndefined();
    expect(config.align).toBeUndefined();
  });

  it("normalizes all mapped values via autoRs using the resolved breakpoint graph", () => {
    const compiler = mockCompiler();
    (createUtility as any).mockReturnValue(compiler);

    (autoRs as any).mockImplementation(
      (value: unknown, bp: AnyBreakpoint[]) => ({
        value,
        bp,
      }),
    );

    const layout = createSuiUtility("layout");
    const result = layout({
      margin: { mobile: 4, desktop: 16 },
    } as any) as any;

    const config = result.__config;

    expect(autoRs).toHaveBeenCalledWith(
      { mobile: 4, desktop: 16 },
      defaultBreakpoints,
    );

    expect(config.margin).toEqual({
      value: { mobile: 4, desktop: 16 },
      bp: defaultBreakpoints,
    });
  });

  it("passes a cloned breakpoint graph and container list to createUtility", () => {
    const compiler = mockCompiler();
    (createUtility as any).mockReturnValue(compiler);
    (autoRs as any).mockImplementation((value: unknown) => value);

    const layout = createSuiUtility("layout");
    const result = layout({
      margin: 10,
      usingBreakpoints: ["mobile", "tablet"],
      usingContainers: ["@container:small"],
    } as any) as any;

    const config = result.__config;

    expect(config.usingBreakpoints).toEqual(["mobile", "tablet"]);
    expect(config.usingContainers).toEqual(["@container:small"]);

    // Ensure they are cloned, not the same reference
    const raw = {
      usingBreakpoints: ["mobile", "tablet"],
      usingContainers: ["@container:small"],
    };

    expect(config.usingBreakpoints).not.toBe(raw.usingBreakpoints);
    expect(config.usingContainers).not.toBe(raw.usingContainers);
  });
});
