import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import * as eventsApi from "../api/events";
import AdminEventsPage from "../pages/AdminEventsPage";

vi.mock("../api/events");

describe("AdminEventsPage", () => {
  it("renders events table when data is available", async () => {
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

    render(
      <MemoryRouter>
        <AdminEventsPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Atelier aquascaping")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
  });

  it("deletes an event after confirmation", async () => {
    const listEventsMock = vi.mocked(eventsApi.listEvents);
    const deleteEventMock = vi.mocked(eventsApi.deleteEvent);
    listEventsMock
      .mockResolvedValueOnce([
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
      ])
      .mockResolvedValueOnce([]);
    deleteEventMock.mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AdminEventsPage />
      </MemoryRouter>,
    );

    await user.click(await screen.findByRole("button", { name: "Supprimer" }));

    expect(deleteEventMock).toHaveBeenCalledWith(1);
    await waitFor(() => expect(listEventsMock.mock.calls.length).toBeGreaterThanOrEqual(2));
  });
});
