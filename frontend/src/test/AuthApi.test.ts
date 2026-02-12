import { describe, it, expect, vi, beforeEach } from "vitest";
import * as authApi from "../api/auth";

const fetchMock = vi.fn();
beforeEach(() => {
  global.fetch = fetchMock as any;
});


describe("auth api", () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  it("sends login request with password", async () => {
    fetchMock.mockResolvedValue({
      json: vi.fn().mockResolvedValue({ token: "abc" }),
    });

    const result = await authApi.login("secret");

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "secret" }),
    });
    expect(result).toEqual({ token: "abc" });
  });

  it("calls logout with bearer token", async () => {
    fetchMock.mockResolvedValue({});

    await authApi.logout("token-123");

    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: "Bearer token-123" },
    });
  });
});
