import { describe, it, expect, beforeEach } from "vitest";
import { tokens as defaultTokens } from "../../tokens/tokens";
import { getTokens, setTokens, resetTokens } from "../../tokens/tokensEngine";

describe("tokensEngine", () => {
  beforeEach(() => {
    resetTokens();
  });

  it("returns the default tokens initially", () => {
    const t = getTokens();
    expect(t).toEqual(defaultTokens);
  });

  it("does not mutate the default token object", () => {
    const before = structuredClone(defaultTokens);

    setTokens({
      typography: {
        fontSize: {
          medium: "999px"
        }
      }
    });

    expect(defaultTokens).toEqual(before);
  });

  it("merges top-level token categories", () => {
    setTokens({
      spacing: {
        space: {
          medium: "20px"
        }
      }
    });

    const t = getTokens();
    expect(t.spacing.space.medium).toBe("20px");
    expect(t.spacing.space.small).toBe(defaultTokens.spacing.space.small);
  });

  it("deep merges nested token values", () => {
    setTokens({
      typography: {
        fontFamily: {
          sans: "Inter, system-ui, sans-serif"
        }
      }
    });

    const t = getTokens();

    expect(t.typography.fontFamily.sans).toBe(
      "Inter, system-ui, sans-serif"
    );

    expect(t.typography.fontFamily.serif).toBe(
      defaultTokens.typography.fontFamily.serif
    );
  });

  it("overwrites non-object values", () => {
    setTokens({
      motion: {
        duration: {
          medium: "999ms"
        }
      }
    });

    const t = getTokens();
    expect(t.motion.duration.medium).toBe("999ms");
  });

  it("supports multiple sequential merges", () => {
    setTokens({
      sizing: {
        size: {
          medium: "100px"
        }
      }
    });

    setTokens({
      sizing: {
        size: {
          large: "200px"
        }
      }
    });

    const t = getTokens();

    expect(t.sizing.size.medium).toBe("100px");
    expect(t.sizing.size.large).toBe("200px");
  });

  it("resetTokens restores the default token set", () => {
    setTokens({
      layout: {
        gap: {
          medium: "999px"
        }
      }
    });

    resetTokens();

    const t = getTokens();
    expect(t).toEqual(defaultTokens);
  });
});
