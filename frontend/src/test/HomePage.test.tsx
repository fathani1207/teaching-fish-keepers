import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as eventsApi from "../api/events";
import HomePage from "../pages/HomePage";

vi.mock("../api/events");

describe("HomePage", () => {
  it("shows loading state then renders events", async () => {
    const listEventsMock = vi.mocked(eventsApi.listEvents);
    listEventsMock.mockResolvedValue([
      {
        id: 1,
        title: "Atelier aquascaping",
        description: "Test",
        date: "2025-01-01T10:00:00.000Z",
        end_date: null,
        location: "Paris",
        image_url: null,
        max_participants: null,
        created_at: "2025-01-01T10:00:00.000Z",
        updated_at: "2025-01-01T10:00:00.000Z",
      },
    ]);

    render(<HomePage />);

    expect(screen.getByText("Chargement des événements...")).toBeInTheDocument();
    expect(await screen.findByText("Atelier aquascaping")).toBeInTheDocument();
  });

  it("shows empty state when no events", async () => {
    const listEventsMock = vi.mocked(eventsApi.listEvents);
    listEventsMock.mockResolvedValue([]);

    render(<HomePage />);

    expect(await screen.findByText("Aucun événement à venir.")).toBeInTheDocument();
  });
});
