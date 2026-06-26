import { describe, it, expect, vi, beforeEach } from "vitest";

import { createUtility } from "../../utilities/createUtility";
import { expandConfigToRules } from "../../utilities/utils";

import {
  hasRule,
  registerRule,
  ruleKey,
  ruleToCSS,
  flushStylesheet,
  injectCSS,
  sortRulesByState,
  hashRuleKey,
  hashCanonicalRule,
  hasCanonicalRule,
} from "../../core";

import { stateKeys } from "../../config";

import type {
  AnyBreakpoint,
  AnyContainerBreakpoint,
  ContainerSizeMap,
  StateKey,
  AtomicRule,
  UtilityMetaConfig,
} from "../../types";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../utilities/utils", () => ({
  expandConfigToRules: vi.fn(),
}));

vi.mock("../../core", () => ({
  hasRule: vi.fn(),
  registerRule: vi.fn(),
  ruleKey: vi.fn(),
  ruleToCSS: vi.fn(),
  flushStylesheet: vi.fn(),
  injectCSS: vi.fn(),
  sortRulesByState: vi.fn(),
  hashRuleKey: vi.fn(),
  hashCanonicalRule: vi.fn(),
  hasCanonicalRule: vi.fn(),
}));

vi.mock("../../config", () => ({
  stateKeys: ["hover", "focus"],
}));

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const defaultBreakpoints: AnyBreakpoint[] = [
  "mobile",
  "tablet",
  "laptop",
  "desktop",
  "monitor",
  "wide",
];


const defaultStates: StateKey[] = ["hover", "focus"];

const defaultContainers: AnyContainerBreakpoint[] = [];

const containerSizes: ContainerSizeMap = {
  small: "300px",
  medium: "600px",
};

// ---------------------------------------------------------------------------
// Test config builders
// ---------------------------------------------------------------------------

function baseConfig(
  overrides: Partial<UtilityMetaConfig> = {},
): UtilityMetaConfig {
  return {
    usingBreakpoints: undefined,
    usingStates: undefined,
    usingContainers: undefined,
    __containerMode: undefined,
    __containerSizes: undefined,
    margin: 10,
    ...overrides,
  } as UtilityMetaConfig;
}

function mockRule(overrides: Partial<AtomicRule> = {}): AtomicRule {
  return {
    namespace: "layout",
    property: "margin",
    value: 10,
    breakpoint: "mobile",
    state: undefined,
    container: undefined,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// createUtility – meta extraction + expansion
// ---------------------------------------------------------------------------

describe("createUtility – meta extraction + expansion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses default breakpoints, states, and containers when meta is omitted", () => {
    const utility = createUtility("layout");
    const config = baseConfig();

    (expandConfigToRules as any).mockReturnValue([]);

    utility(config);

    expect(expandConfigToRules).toHaveBeenCalledTimes(1);

    const args = (expandConfigToRules as any).mock.calls[0];

    const namespace = args[0] as string;
    const rest = args[1] as Record<string, unknown>;
    const activeBreakpoints = args[2] as AnyBreakpoint[];
    const activeStates = args[3] as StateKey[];
    const containerMode = args[4] as boolean;
    const containerSizesArg = args[5] as ContainerSizeMap | null;
    const activeContainers = args[6] as AnyContainerBreakpoint[];

    expect(namespace).toBe("layout");
    expect(rest).toHaveProperty("margin", 10);
    expect(activeBreakpoints).toEqual(defaultBreakpoints);
    expect(activeStates).toEqual(defaultStates);
    expect(containerMode).toBe(false);
    expect(containerSizesArg).toBeNull();
    expect(activeContainers).toEqual(defaultContainers);
  });

  it("respects explicit usingBreakpoints, usingStates, and usingContainers", () => {
    const utility = createUtility("layout");

    const config = baseConfig({
      usingBreakpoints: ["mobile", "@600"],
      usingStates: ["hover"],
      usingContainers: ["@container:small"],
    });

    (expandConfigToRules as any).mockReturnValue([]);

    utility(config);

    const args = (expandConfigToRules as any).mock.calls[0];

    const activeBreakpoints = args[2] as AnyBreakpoint[];
    const activeStates = args[3] as StateKey[];
    const activeContainers = args[6] as AnyContainerBreakpoint[];

    expect(activeBreakpoints).toEqual(["mobile", "@600"]);
    expect(activeStates).toEqual(["hover"]);
    expect(activeContainers).toEqual(["@container:small"]);
  });

  it("enables containerMode and normalizes containerSizes when valid", () => {
    const utility = createUtility("layout");

    const config = baseConfig({
      __containerMode: true,
      __containerSizes: containerSizes,
    });

    (expandConfigToRules as any).mockReturnValue([]);

    utility(config);

    const args = (expandConfigToRules as any).mock.calls[0];

    const containerMode = args[4] as boolean;
    const containerSizesArg = args[5] as ContainerSizeMap | null;

    expect(containerMode).toBe(true);
    expect(containerSizesArg).toEqual(containerSizes);
  });

  it("falls back to containerSizes=null when sizes are not plain string map", () => {
    const utility = createUtility("layout");

    const config = baseConfig({
      __containerMode: true,
      __containerSizes: { small: 300 } as any,
    });

    (expandConfigToRules as any).mockReturnValue([]);

    utility(config);

    const args = (expandConfigToRules as any).mock.calls[0];

    const containerMode = args[4] as boolean;
    const containerSizesArg = args[5] as ContainerSizeMap | null;

    expect(containerMode).toBe(true);
    expect(containerSizesArg).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// createUtility – UtilityResult + atomize pipeline
// ---------------------------------------------------------------------------

describe("createUtility – UtilityResult + atomization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a UtilityResult with __utility=true and rules from expandConfigToRules", () => {
    const utility = createUtility("layout");

    const rules: AtomicRule[] = [
      mockRule({ breakpoint: "mobile" }),
      mockRule({ breakpoint: "tablet", value: 20 }),
    ];

    (expandConfigToRules as any).mockReturnValue(rules);
    (sortRulesByState as any).mockReturnValue(rules);
    (ruleKey as any).mockImplementation(
      (r: AtomicRule) => `${r.property}-${r.breakpoint}`,
    );
    (hashRuleKey as any).mockImplementation((key: string) => `h-${key}`);
    (hashCanonicalRule as any).mockImplementation(
      (d: any) => `c-${d.selector}`,
    );
    (hasCanonicalRule as any).mockReturnValue(false);
    (hasRule as any).mockReturnValue(false);
    (ruleToCSS as any).mockImplementation(
      (r: AtomicRule, h: string) => `.${h}{${r.property}:${r.value}}`,
    );

    const result = utility(baseConfig());

    expect(result.__utility).toBe(true);
    expect(result.rules).toEqual(rules);
  });

  it("atomize() hashes rules, registers CSS, and flushes stylesheet", () => {
    const utility = createUtility("layout");

    const rules: AtomicRule[] = [
      mockRule({ breakpoint: "mobile", value: 10 }),
      mockRule({ breakpoint: "tablet", value: 20 }),
    ];

    (expandConfigToRules as any).mockReturnValue(rules);
    (sortRulesByState as any).mockReturnValue(rules);
    (ruleKey as any).mockImplementation(
      (r: AtomicRule) => `${r.property}-${r.breakpoint}`,
    );
    (hashRuleKey as any).mockImplementation((key: string) => `h-${key}`);
    (hashCanonicalRule as any).mockImplementation(
      (d: any) => `c-${d.selector}`,
    );
    (hasCanonicalRule as any).mockReturnValue(false);
    (hasRule as any).mockReturnValue(false);
    (ruleToCSS as any).mockImplementation(
      (r: AtomicRule, h: string) => `.${h}{${r.property}:${r.value}}`,
    );

    const result = utility(baseConfig());
    const classNames = result.atomize();

    expect(sortRulesByState).toHaveBeenCalledWith(rules);
    expect(ruleKey).toHaveBeenCalledTimes(2);
    expect(hashRuleKey).toHaveBeenCalledTimes(2);
    expect(hashCanonicalRule).toHaveBeenCalledTimes(2);
    expect(registerRule).toHaveBeenCalledTimes(2);
    expect(injectCSS).toHaveBeenCalledTimes(2);
    expect(flushStylesheet).toHaveBeenCalledTimes(1);

    expect(classNames).toBe("h-margin-mobile h-margin-tablet");
  });

  it("skips emitRule when canonical already exists", () => {
    const utility = createUtility("layout");

    const rules: AtomicRule[] = [mockRule({ breakpoint: "mobile", value: 10 })];

    (expandConfigToRules as any).mockReturnValue(rules);
    (sortRulesByState as any).mockReturnValue(rules);
    (ruleKey as any).mockImplementation(
      (r: AtomicRule) => `${r.property}-${r.breakpoint}`,
    );
    (hashRuleKey as any).mockImplementation((key: string) => `h-${key}`);
    (hashCanonicalRule as any).mockImplementation(
      (d: any) => `c-${d.selector}`,
    );
    (hasCanonicalRule as any).mockReturnValue(true);

    const result = utility(baseConfig());
    const classNames = result.atomize();

    expect(registerRule).not.toHaveBeenCalled();
    expect(injectCSS).not.toHaveBeenCalled();
    expect(flushStylesheet).toHaveBeenCalledTimes(1);
    expect(classNames).toBe("h-margin-mobile");
  });

  it("avoids duplicate registerRule when hasRule(hash) is true", () => {
    const utility = createUtility("layout");

    const rules: AtomicRule[] = [mockRule({ breakpoint: "mobile", value: 10 })];

    (expandConfigToRules as any).mockReturnValue(rules);
    (sortRulesByState as any).mockReturnValue(rules);
    (ruleKey as any).mockImplementation(
      (r: AtomicRule) => `${r.property}-${r.breakpoint}`,
    );
    (hashRuleKey as any).mockImplementation((key: string) => `h-${key}`);
    (hashCanonicalRule as any).mockImplementation(
      (d: any) => `c-${d.selector}`,
    );
    (hasCanonicalRule as any).mockReturnValue(false);
    (hasRule as any).mockReturnValue(true);

    const result = utility(baseConfig());
    result.atomize();

    expect(registerRule).not.toHaveBeenCalled();
    expect(injectCSS).not.toHaveBeenCalled();
    expect(flushStylesheet).toHaveBeenCalledTimes(1);
  });
});
