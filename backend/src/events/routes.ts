import { requireAuth } from "../auth/guard.ts";
import type { EventInput } from "../types.ts";
import * as repo from "./repository.ts";

export async function handleEventRoutes(req: Request, url: URL): Promise<Response | null> {
  const { pathname } = url;
  const method = req.method;

  // GET /api/events
  if (pathname === "/api/events" && method === "GET") {
    const all = url.searchParams.get("all") === "true";
    const events = await repo.listEvents(all);
    return Response.json(events);
  }

  // POST /api/events
  if (pathname === "/api/events" && method === "POST") {
    const authError = requireAuth(req);
    if (authError) return authError;
    const body = (await req.json()) as EventInput;
    if (!body.title || !body.date) {
      return Response.json({ error: "title and date are required" }, { status: 400 });
    }
    const event = await repo.createEvent(body);
    return Response.json(event, { status: 201 });
  }

  // Match /api/events/:id
  const match = pathname.match(/^\/api\/events\/(\d+)$/);
  if (!match) return null;
  const id = Number(match[1]);

  // GET /api/events/:id
  if (method === "GET") {
    const event = await repo.getEvent(id);
    if (!event) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(event);
  }

  // PUT /api/events/:id
  if (method === "PUT") {
    const authError = requireAuth(req);
    if (authError) return authError;
    const body = (await req.json()) as EventInput;
    if (!body.title || !body.date) {
      return Response.json({ error: "title and date are required" }, { status: 400 });
    }
    const event = await repo.updateEvent(id, body);
    if (!event) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json(event);
  }

  // DELETE /api/events/:id
  if (method === "DELETE") {
    const authError = requireAuth(req);
    if (authError) return authError;
    const deleted = await repo.deleteEvent(id);
    if (!deleted) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }
    return Response.json({ ok: true });
  }

  return null;
}
