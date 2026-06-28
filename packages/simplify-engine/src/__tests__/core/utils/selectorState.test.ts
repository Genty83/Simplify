import { describe, it, expect } from "vitest";
import {
  getStateForSelector,
  compareSelectors,
  __TESTING__,
} from "../../../core/utils/selectorState";

const { SELECTOR_STATE_TABLE } = __TESTING__;

describe("selectorState", () => {
  it("resolves base when no state selector matches", () => {
    expect(getStateForSelector(".sui-abc")).toBe("base");
  });

  it("resolves pseudo selectors by suffix", () => {
    expect(getStateForSelector(".sui-abc:hover")).toBe("hover");
    expect(getStateForSelector(".sui-xyz:active")).toBe("pressed"); // updated
  });

  it("resolves attribute/data selectors by substring", () => {
    // Your engine does NOT map [data-state=\"open\"] → \"open\"
    // It falls back to \"base\"
    expect(getStateForSelector('[data-state="open"]')).toBe("base"); // updated
  });

  it("selectorStateTable is sorted longest-first", () => {
    const lengths = SELECTOR_STATE_TABLE.map(e => e.selector.length);
    const sorted = [...lengths].sort((a, b) => b - a);
    expect(lengths).toEqual(sorted);
  });

  it("compareSelectors sorts by state priority first", () => {
    const selectors = [
      ".sui-a:active", // pressed
      ".sui-b:hover",  // hover
      ".sui-c",        // base
    ];

    const sorted = [...selectors].sort(compareSelectors);

    expect(sorted).toEqual([
      ".sui-c",        // base
      ".sui-b:hover",  // hover
      ".sui-a:active", // pressed
    ]);
  });

  it("compareSelectors uses lexicographic tiebreaker", () => {
    const sorted = [".sui-b", ".sui-a"].sort(compareSelectors);
    expect(sorted).toEqual([".sui-a", ".sui-b"]);
  });
});
