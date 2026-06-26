import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  resolveValue,
  pushRule,
  expandProperty,
  expandConfigToRules,
} from "../../utilities/utils";

import type {
  AnyBreakpoint,
  AnyContainerBreakpoint,
  StateKey,
  ContainerSizeMap,
} from "../../types";

// ---------------------------------------------------------------------------
// Typed mocks
// ---------------------------------------------------------------------------

const breakpoints: AnyBreakpoint[] = [
  "mobile",
  "tablet",
  "laptop",
  "desktop",
];

const states: StateKey[] = ["hover", "focus"];

// No container breakpoints for normal tests
const usingContainers: AnyContainerBreakpoint[] = [];

const containerSizes: ContainerSizeMap = {
  small: "300px",
  medium: "600px",
  large: "900px",
};

// ---------------------------------------------------------------------------
// Partial mocks (TS-safe)
// ---------------------------------------------------------------------------

vi.mock("../../services", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>;
  return {
    ...actual,
    expandResponsiveValue: vi.fn(),
    expandStateValue: vi.fn(),
    isStateful: vi.fn(),
    parseContainerQuery: vi.fn(),
  };
});

vi.mock("../../color", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>;
  return {
    ...actual,
    isPaint: vi.fn(),
    resolvePaint: vi.fn(),
  };
});

vi.mock("../../core", async (importOriginal) => {
  const actual = await importOriginal() as Record<string, any>;
  return {
    ...actual,
    normalize: vi.fn(),
  };
});

// Import mocks AFTER mocking
import {
  expandResponsiveValue,
  expandStateValue,
  isStateful,
  parseContainerQuery,
} from "../../services";

import { normalize } from "../../core";
import { isPaint, resolvePaint } from "../../color";

// ---------------------------------------------------------------------------
// resolveValue
// ---------------------------------------------------------------------------

describe("resolveValue", () => {
  it("resolves paint tokens", () => {
    (isPaint as any).mockReturnValue(true);
    (resolvePaint as any).mockReturnValue("rgba(0,0,0,0.5)");

    const paint = { token: "primary", options: { alpha: 0.5 } };

    expect(resolveValue(paint)).toBe("rgba(0,0,0,0.5)");
  });

  it("normalizes primitives", () => {
    (isPaint as any).mockReturnValue(false);
    (normalize as any).mockReturnValue("10px");

    expect(resolveValue(10)).toBe("10px");
  });
});

// ---------------------------------------------------------------------------
// pushRule
// ---------------------------------------------------------------------------

describe("pushRule", () => {
  it("pushes a normalized atomic rule", () => {
    (isPaint as any).mockReturnValue(false);
    (normalize as any).mockReturnValue("20px");

    const rules: any[] = [];

    pushRule(rules, "ui", "margin", 20);

    expect(rules).toEqual([
      {
        namespace: "ui",
        property: "margin",
        value: "20px",
        breakpoint: undefined,
        state: undefined,
        container: undefined,
      },
    ]);
  });
});

// ---------------------------------------------------------------------------
// expandProperty
// ---------------------------------------------------------------------------

describe("expandProperty", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws on nullish values", () => {
    const rules: any[] = [];

    expect(() =>
      expandProperty(
        rules,
        "ui",
        "padding",
        null,
        breakpoints,
        states,
        false,
        null,
        usingContainers
      )
    ).toThrow("Invalid utility value");
  });

  it("expands stateful values first", () => {
    (isStateful as any).mockReturnValue(true);
    (expandStateValue as any).mockReturnValue([
      ["hover", 10],
      ["focus", 20],
    ]);

    (expandResponsiveValue as any).mockReturnValue([
      { value: 10 },
      { value: 20 },
    ]);

    const rules: any[] = [];

    expandProperty(
      rules,
      "ui",
      "gap",
      { value: 10 },
      breakpoints,
      states,
      false,
      null,
      usingContainers
    );

    expect(expandStateValue).toHaveBeenCalled();
    expect(expandResponsiveValue).toHaveBeenCalledTimes(2);
  });

  it("expands responsive values when not stateful", () => {
    (isStateful as any).mockReturnValue(false);

    (expandResponsiveValue as any).mockReturnValue([
      { value: 5 },
      { value: 10 },
    ]);

    const rules: any[] = [];

    expandProperty(
      rules,
      "ui",
      "margin",
      5,
      breakpoints,
      states,
      false,
      null,
      usingContainers
    );

    expect(expandResponsiveValue).toHaveBeenCalled();
    expect(rules.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// expandConfigToRules
// ---------------------------------------------------------------------------

describe("expandConfigToRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws on non-object config", () => {
    expect(() =>
      expandConfigToRules(
        "ui",
        null as any,
        breakpoints,
        states,
        false,
        null,
        usingContainers
      )
    ).toThrow("Invalid utility config");
  });

  it("ignores meta keys", () => {
    (isStateful as any).mockReturnValue(false);
    (expandResponsiveValue as any).mockReturnValue([{ value: 10 }]);

    const config = {
      usingBreakpoints: true,
      usingStates: true,
      usingContainers: true,
      margin: 10,
    };

    const rules = expandConfigToRules(
      "ui",
      config,
      breakpoints,
      states,
      false,
      null,
      usingContainers
    );

    expect(rules.length).toBe(1);
    expect(rules[0].property).toBe("margin");
  });

  it("expands multiple properties", () => {
    (isStateful as any).mockReturnValue(false);
    (expandResponsiveValue as any).mockReturnValue([
      { value: 10 },
      { value: 20 },
    ]);

    const config = {
      margin: 10,
      padding: 20,
    };

    const rules = expandConfigToRules(
      "ui",
      config,
      breakpoints,
      states,
      false,
      null,
      usingContainers
    );

    expect(rules.length).toBe(4);
  });

  it("applies container wrapping when containerMode=true", () => {
    (isStateful as any).mockReturnValue(false);
    (expandResponsiveValue as any).mockReturnValue([{ value: 100 }]);
    (parseContainerQuery as any).mockReturnValue("(width > 300px)");

    const config = { width: 100 };

    const rules = expandConfigToRules(
      "ui",
      config,
      breakpoints,
      states,
      true,
      containerSizes,
      ["@container:small"]
    );

    expect(rules[0].container).toBe("(width > 300px)");
  });

  it("throws when containerMode=true but no sizes provided", () => {
    (isStateful as any).mockReturnValue(false);
    (expandResponsiveValue as any).mockReturnValue([{ value: 100 }]);

    const config = { width: 100 };

    expect(() =>
      expandConfigToRules(
        "ui",
        config,
        breakpoints,
        states,
        true,
        null,
        ["@container:small"]
      )
    ).toThrow("Container mode requires a valid container size map");
  });
});
