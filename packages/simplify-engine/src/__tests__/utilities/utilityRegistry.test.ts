import { describe, it, expect, beforeEach } from "vitest";

import {
  registerUtility,
  getRegisteredUtilities,
} from "../../utilities/utilityRegistry";

import type { RegisteredUtilities, UtilityFactory } from "../../types";

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeFactory<T extends object>(label: string): UtilityFactory<T> {
  return ((props: T) => ({
    __utility: true,
    rules: [],
    atomize: () => label,
  })) as UtilityFactory<T>;
}

// Reset registry between tests by re-importing the module
// (the registry is module‑scoped and must be cleared)
async function resetRegistry() {
  const modPath = "../../utilities/utilityRegistry";
  const mod = await import(modPath);
  const map = mod.getRegisteredUtilities();
  (map as Map<any, any>).clear();
}


beforeEach(() => {
  resetRegistry();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("utilityRegistry – registration + retrieval", () => {
  it("starts empty", () => {
    const reg = getRegisteredUtilities();
    expect(reg.size).toBe(0);
  });

  it("registers a utility factory under a namespace", () => {
    const layoutFactory = makeFactory<RegisteredUtilities["layout"]>("layout");

    registerUtility("layout", layoutFactory);

    const reg = getRegisteredUtilities();

    expect(reg.size).toBe(1);
    expect(reg.get("layout")).toBe(layoutFactory);
  });

  it("overwrites an existing namespace deterministically", () => {
    const first = makeFactory<RegisteredUtilities["layout"]>("first");
    const second = makeFactory<RegisteredUtilities["layout"]>("second");

    registerUtility("layout", first);
    registerUtility("layout", second);

    const reg = getRegisteredUtilities();

    expect(reg.size).toBe(1);
    expect(reg.get("layout")).toBe(second);
  });

  it("returns the internal map without cloning", () => {
    const factory = makeFactory<RegisteredUtilities["layout"]>("layout");

    registerUtility("layout", factory);

    const reg = getRegisteredUtilities();
    const sameRef = getRegisteredUtilities();

    expect(reg).toBe(sameRef);
  });

  it("returned map must be treated as read‑only by consumers", () => {
    const factory = makeFactory<RegisteredUtilities["layout"]>("layout");

    registerUtility("layout", factory);

    const reg = getRegisteredUtilities();

    // Consumers *could* mutate it, but they must not.
    // We assert that the registry does not protect against mutation.
    (reg as Map<any, any>).delete("layout");

    const reg2 = getRegisteredUtilities();
    expect(reg2.size).toBe(0);
  });
});
