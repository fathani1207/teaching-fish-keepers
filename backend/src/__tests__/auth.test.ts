import { describe, expect, test } from "bun:test";
import { requireAuth } from "../auth/guard";
import { extractBearerToken, handleAuthRoutes } from "../auth/routes";
import { createSession, validateSession } from "../auth/sessions";

function makeJsonRequest(path: string, method: string, body?: unknown, headers?: HeadersInit) {
  const url = new URL(`http://localhost${path}`);
  const req = new Request(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { req, url };
}

describe("auth routes", () => {
  test("POST /api/auth/login returns token on success", async () => {
    const { req, url } = makeJsonRequest("/api/auth/login", "POST", {
      password: "admin",
    });

    const res = await handleAuthRoutes(req, url);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(200);

    if (!res) throw new Error("Response is null");
    const payload = await res.json();
    expect(typeof payload.token).toBe("string");
    expect(payload.token.length).toBeGreaterThan(0);
  });

  test("POST /api/auth/login rejects invalid password", async () => {
    const { req, url } = makeJsonRequest("/api/auth/login", "POST", {
      password: "nope",
    });

    const res = await handleAuthRoutes(req, url);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(401);
  });

  test("GET /api/auth/me returns authenticated true with valid token", async () => {
    const token = createSession();
    const { req, url } = makeJsonRequest("/api/auth/me", "GET", undefined, {
      Authorization: `Bearer ${token}`,
    });

    const res = await handleAuthRoutes(req, url);
    if (!res) throw new Error("Response is null");
    const payload = await res.json();
    expect(payload.authenticated).toBe(true);
  });

  test("GET /api/auth/me returns authenticated false without token", async () => {
    const { req, url } = makeJsonRequest("/api/auth/me", "GET");
    const res = await handleAuthRoutes(req, url);
    if (!res) throw new Error("Response is null");
    const payload = await res.json();
    expect(payload.authenticated).toBe(false);
  });

  test("POST /api/auth/logout deletes session", async () => {
    const token = createSession();
    const { req, url } = makeJsonRequest("/api/auth/logout", "POST", undefined, {
      Authorization: `Bearer ${token}`,
    });

    const res = await handleAuthRoutes(req, url);
    if (!res) throw new Error("Response is null");
    const payload = await res.json();
    expect(payload.ok).toBe(true);
    expect(validateSession(token)).toBe(false);
  });
});

describe("auth helpers", () => {
  test("extractBearerToken returns token when header is present", () => {
    const token = "abc123";
    const req = new Request("http://localhost", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(extractBearerToken(req)).toBe(token);
  });

  test("extractBearerToken returns null for missing or invalid header", () => {
    const req = new Request("http://localhost");
    expect(extractBearerToken(req)).toBeNull();
  });

  test("requireAuth returns 401 when unauthenticated", () => {
    const req = new Request("http://localhost");
    const res = requireAuth(req);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(401);
  });

  test("requireAuth returns null when authenticated", () => {
    const token = createSession();
    const req = new Request("http://localhost", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = requireAuth(req);
    expect(res).toBeNull();
  });
});
