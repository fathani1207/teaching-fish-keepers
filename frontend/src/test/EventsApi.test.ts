import { describe, it, expect, vi, beforeEach } from "vitest";
import * as eventsApi from "../api/events";

const fetchMock = vi.fn();
beforeEach(() => {
  global.fetch = fetchMock as any;
});

describe("events api", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    localStorage.clear();
  });

  it("lists events and throws on error", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue([]) })
      .mockResolvedValueOnce({ ok: false, json: vi.fn() });

    await expect(eventsApi.listEvents()).resolves.toEqual([]);
    await expect(eventsApi.listEvents()).rejects.toThrow(
      "Failed to fetch events",
    );
  });

  it("creates event with auth header when token exists", async () => {
    localStorage.setItem("club_poisson_token", "token-xyz");
    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 1 }),
    });

    await eventsApi.createEvent({ title: "New", date: "2025-01-01" });

    expect(fetchMock).toHaveBeenCalledWith("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer token-xyz",
      },
      body: JSON.stringify({ title: "New", date: "2025-01-01" }),
    });
  });
});
