import { beforeAll, describe, expect, test } from "bun:test";
import { createSession } from "../auth/sessions";
import { migrate } from "../db/migrate";
import * as repo from "../events/repository";
import { handleEventRoutes } from "../events/routes";

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

function makeEventInput() {
  return {
    title: `Test Event ${crypto.randomUUID()}`,
    description: "Unit test event",
    date: new Date(Date.now() + 86_400_000).toISOString(),
    location: "Test location",
  };
}

beforeAll(async () => {
  await migrate();
});

describe("event routes", () => {
  test("POST /api/events requires auth", async () => {
    const { req, url } = makeJsonRequest("/api/events", "POST", makeEventInput());
    const res = await handleEventRoutes(req, url);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(401);
  });

  test("POST /api/events validates title and date", async () => {
    const token = createSession();
    const { req, url } = makeJsonRequest(
      "/api/events",
      "POST",
      { title: "", date: "" },
      { Authorization: `Bearer ${token}` },
    );
    const res = await handleEventRoutes(req, url);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(400);
  });

  test("POST /api/events creates event", async () => {
    const token = createSession();
    const input = makeEventInput();
    const { req, url } = makeJsonRequest("/api/events", "POST", input, {
      Authorization: `Bearer ${token}`,
    });
    const res = await handleEventRoutes(req, url);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(201);
    if (!res) throw new Error("Response is null");
    const payload = await res.json();
    expect(payload.title).toBe(input.title);
    await repo.deleteEvent(payload.id);
  });

  test("GET /api/events returns events when all=true", async () => {
    const past = await repo.createEvent({
      ...makeEventInput(),
      title: `Past Route ${crypto.randomUUID()}`,
      date: new Date(Date.now() - 86_400_000).toISOString(),
    });
    const future = await repo.createEvent({
      ...makeEventInput(),
      title: `Future Route ${crypto.randomUUID()}`,
      date: new Date(Date.now() + 86_400_000).toISOString(),
    });

    try {
      const { req, url } = makeJsonRequest("/api/events?all=true", "GET");
      const res = await handleEventRoutes(req, url);
      expect(res).not.toBeNull();
      expect(res?.status).toBe(200);
      if (!res) throw new Error("Response is null");
      const payload = await res.json();
      const titles = payload.map((event: { title: string }) => event.title);
      expect(titles).toContain(past.title);
      expect(titles).toContain(future.title);
    } finally {
      await repo.deleteEvent(past.id);
      await repo.deleteEvent(future.id);
    }
  });

  test("GET /api/events/:id returns event when found", async () => {
    const created = await repo.createEvent(makeEventInput());

    try {
      const { req, url } = makeJsonRequest(`/api/events/${created.id}`, "GET");
      const res = await handleEventRoutes(req, url);
      expect(res).not.toBeNull();
      expect(res?.status).toBe(200);
      if (!res) throw new Error("Response is null");
      const payload = await res.json();
      expect(payload.id).toBe(created.id);
      expect(payload.title).toBe(created.title);
    } finally {
      await repo.deleteEvent(created.id);
    }
  });

  test("GET /api/events/:id returns 404 when not found", async () => {
    const input = makeEventInput();
    const created = await repo.createEvent(input);
    await repo.deleteEvent(created.id);

    const { req, url } = makeJsonRequest(`/api/events/${created.id}`, "GET");
    const res = await handleEventRoutes(req, url);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(404);
  });

  test("PUT /api/events/:id requires auth", async () => {
    const { req, url } = makeJsonRequest("/api/events/123", "PUT", makeEventInput());
    const res = await handleEventRoutes(req, url);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(401);
  });

  test("PUT /api/events/:id validates title and date", async () => {
    const token = createSession();
    const { req, url } = makeJsonRequest(
      "/api/events/123",
      "PUT",
      { title: "", date: "" },
      { Authorization: `Bearer ${token}` },
    );
    const res = await handleEventRoutes(req, url);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(400);
  });

  test("PUT /api/events/:id returns 404 when not found", async () => {
    const token = createSession();
    const { req, url } = makeJsonRequest("/api/events/9999999", "PUT", makeEventInput(), {
      Authorization: `Bearer ${token}`,
    });
    const res = await handleEventRoutes(req, url);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(404);
  });

  test("DELETE /api/events/:id requires auth", async () => {
    const { req, url } = makeJsonRequest("/api/events/123", "DELETE");
    const res = await handleEventRoutes(req, url);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(401);
  });

  test("DELETE /api/events/:id returns 404 when not found", async () => {
    const token = createSession();
    const { req, url } = makeJsonRequest("/api/events/9999999", "DELETE", undefined, {
      Authorization: `Bearer ${token}`,
    });
    const res = await handleEventRoutes(req, url);
    expect(res).not.toBeNull();
    expect(res?.status).toBe(404);
  });
});
