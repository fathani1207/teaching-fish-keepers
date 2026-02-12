import { describe, expect, test } from "bun:test";
import { createSession, deleteSession, validateSession } from "../auth/sessions";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

describe("sessions", () => {
  test("createSession returns a valid token", () => {
    const token = createSession();
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
    expect(validateSession(token)).toBe(true);
    deleteSession(token);
  });

  test("validateSession expires after TTL", () => {
    const realNow = Date.now;
    const base = 1_700_000_000_000;
    try {
      Date.now = () => base;
      const token = createSession();

      Date.now = () => base + ONE_DAY_MS + 1;
      expect(validateSession(token)).toBe(false);
    } finally {
      Date.now = realNow;
    }
  });

  test("deleteSession invalidates a token", () => {
    const token = createSession();
    deleteSession(token);
    expect(validateSession(token)).toBe(false);
  });
});
