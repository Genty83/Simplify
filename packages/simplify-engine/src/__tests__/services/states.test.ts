import { describe, it, expect, beforeEach } from "vitest";

import {
  states,
  isStateful,
  tupleToStates,
  isRawStateObject,
  expandStateObject,
  expandStateValue,
  autoStates,
} from "../../services";

import { stateKeys } from "../../config";

import type { StateKey, StateValue, StateWrapper } from "../../types";

// ---------------------------------------------------------------------------
// Shared test data
// ---------------------------------------------------------------------------

const activeStates: StateKey[] = [...stateKeys];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("states.ts – structural state engine", () => {
  beforeEach(() => {
    // Pure module — no mocks needed
  });

  // -------------------------------------------------------------------------
  // states()
  // -------------------------------------------------------------------------

  describe("states", () => {
    it("wraps a value in a structural state wrapper", () => {
      const wrapped = states({ hover: 10 });

      expect(wrapped).toEqual({
        __states: true,
        value: { hover: 10 },
      });
    });
  });

  // -------------------------------------------------------------------------
  // isStateful()
  // -------------------------------------------------------------------------

  describe("isStateful", () => {
    it("detects structural state wrappers", () => {
      expect(isStateful(states({ hover: 10 }))).toBe(true);
    });

    it("rejects non-wrappers", () => {
      expect(isStateful({ hover: 10 })).toBe(false);
      expect(isStateful(null)).toBe(false);
      expect(isStateful(undefined)).toBe(false);
      expect(isStateful([])).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // tupleToStates()
  // -------------------------------------------------------------------------

  describe("tupleToStates", () => {
    it("maps tuple entries to state keys", () => {
      const tuple = [10, 20, 30];
      const out = tupleToStates(tuple, activeStates);

      expect(out).toEqual({
        base: 10,
        hover: 20,
        pressed: 30, // ✔ correct key
      });
    });

    it("throws when tuple is longer than activeStates", () => {
      expect(() => tupleToStates([10, 20], ["base"])).toThrow(
        "tuple length 2 exceeds activeStates length 1",
      );
    });
  });

  // -------------------------------------------------------------------------
  // isRawStateObject()
  // -------------------------------------------------------------------------

  describe("isRawStateObject", () => {
    it("detects plain state objects", () => {
      expect(isRawStateObject({ base: 10, hover: 20 })).toBe(true);
    });

    it("rejects empty objects", () => {
      expect(isRawStateObject({})).toBe(false);
    });

    it("rejects arrays", () => {
      expect(isRawStateObject([10, 20])).toBe(false);
    });

    it("rejects non-state keys", () => {
      expect(isRawStateObject({ foo: 10 })).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // expandStateObject()
  // -------------------------------------------------------------------------

  describe("expandStateObject", () => {
    it("expands state object in canonical stateKeys order", () => {
      const value = {
        hover: 20,
        base: 10,
        focus: 30,
      };

      const out = expandStateObject(value);

      expect(out).toEqual([
        ["base", 10],
        ["hover", 20],
        ["focus", 30],
      ]);
    });

    it("skips undefined entries", () => {
      const value = { base: 10, hover: undefined };

      const out = expandStateObject(value);

      expect(out).toEqual([["base", 10]]);
    });
  });

  // -------------------------------------------------------------------------
  // expandStateValue()
  // -------------------------------------------------------------------------

  describe("expandStateValue", () => {
    it("expands wrapped state values", () => {
      const wrapped = states({ base: 10, hover: 20 });

      const out = expandStateValue(wrapped, activeStates);

      expect(out).toEqual([
        ["base", 10],
        ["hover", 20],
      ]);
    });

    it("expands tuples", () => {
      const out = expandStateValue([10, 20], activeStates);

      expect(out).toEqual([
        ["base", 10],
        ["hover", 20],
      ]);
    });

    it("expands raw state objects", () => {
      const out = expandStateValue({ base: 10 }, activeStates);

      expect(out).toEqual([["base", 10]]);
    });

    it("expands bare values into base state", () => {
      const out = expandStateValue(99, activeStates);

      expect(out).toEqual([["base", 99]]);
    });
  });

  // -------------------------------------------------------------------------
  // autoStates()
  // -------------------------------------------------------------------------

  describe("autoStates", () => {
    it("wraps tuples into state wrappers", () => {
      const out = autoStates([10, 20], activeStates);

      expect(out).toEqual({
        __states: true,
        value: {
          base: 10,
          hover: 20,
        },
      });
    });

    it("wraps raw state objects", () => {
      const out = autoStates({ base: 10 }, activeStates);

      expect(out).toEqual({
        __states: true,
        value: { base: 10 },
      });
    });

    it("returns bare values unchanged", () => {
      expect(autoStates(10, activeStates)).toBe(10);
      expect(autoStates("x", activeStates)).toBe("x");
    });
  });
});
