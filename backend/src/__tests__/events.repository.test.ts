import { beforeAll, describe, expect, test } from "bun:test";
import { migrate } from "../db/migrate";
import * as repo from "../events/repository";

function makeEventInput(overrides?: Partial<ReturnType<typeof baseInput>>) {
  return { ...baseInput(), ...(overrides ?? {}) };
}

function baseInput() {
  return {
    title: `Repo Event ${crypto.randomUUID()}`,
    description: "Repository test event",
    date: new Date(Date.now() + 86_400_000).toISOString(),
    end_date: null,
    location: "Test location",
    image_url: null,
    max_participants: null,
  };
}

beforeAll(async () => {
  await migrate();
});

describe("events repository", () => {
  test("create/get/update/delete roundtrip", async () => {
    const created = await repo.createEvent(makeEventInput());

    try {
      const fetched = await repo.getEvent(created.id);
      expect(fetched).not.toBeUndefined();
      expect(fetched?.title).toBe(created.title);

      const updated = await repo.updateEvent(created.id, {
        ...makeEventInput(),
        title: `${created.title} updated`,
      });
      expect(updated).not.toBeUndefined();
      expect(updated?.title).toBe(`${created.title} updated`);

      const deleted = await repo.deleteEvent(created.id);
      expect(deleted).toBe(true);

      const afterDelete = await repo.getEvent(created.id);
      expect(afterDelete).toBeUndefined();
    } finally {
      await repo.deleteEvent(created.id);
    }
  });

  test("listEvents filters past events when all=false", async () => {
    const past = await repo.createEvent(
      makeEventInput({
        title: `Past Event ${crypto.randomUUID()}`,
        date: new Date(Date.now() - 86_400_000).toISOString(),
      }),
    );
    const future = await repo.createEvent(
      makeEventInput({
        title: `Future Event ${crypto.randomUUID()}`,
        date: new Date(Date.now() + 86_400_000).toISOString(),
      }),
    );

    try {
      const upcoming = await repo.listEvents(false);
      const upcomingTitles = upcoming.map((event) => event.title);
      expect(upcomingTitles).toContain(future.title);
      expect(upcomingTitles).not.toContain(past.title);

      const all = await repo.listEvents(true);
      const allTitles = all.map((event) => event.title);
      expect(allTitles).toContain(future.title);
      expect(allTitles).toContain(past.title);
    } finally {
      await repo.deleteEvent(past.id);
      await repo.deleteEvent(future.id);
    }
  });
});
