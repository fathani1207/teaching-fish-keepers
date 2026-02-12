import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import * as eventsApi from "../api/events";
import EventFormPage from "../pages/EventFormPage";

vi.mock("../api/events");

describe("EventFormPage", () => {
  it("creates a new event and navigates back", async () => {
    const createEventMock = vi.mocked(eventsApi.createEvent);
    createEventMock.mockResolvedValue({
      id: 1,
      title: "Nouveau",
      description: "Test",
      date: "2025-01-01T10:00:00.000Z",
      end_date: null,
      location: "Paris",
      image_url: null,
      max_participants: null,
      created_at: "2025-01-01T10:00:00.000Z",
      updated_at: "2025-01-01T10:00:00.000Z",
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/admin/events/new"]}>
        <Routes>
          <Route path="/admin/events/new" element={<EventFormPage />} />
          <Route path="/admin" element={<div>Admin landing</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Titre *"), "Nouveau");
    await user.type(screen.getByLabelText("Date de début *"), "2025-01-01T10:30");
    await user.click(screen.getByRole("button", { name: "Créer" }));

    expect(createEventMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Admin landing")).toBeInTheDocument();
  });

  it("loads event data in edit mode and updates", async () => {
    const getEventMock = vi.mocked(eventsApi.getEvent);
    const updateEventMock = vi.mocked(eventsApi.updateEvent);
    getEventMock.mockResolvedValue({
      id: 2,
      title: "Atelier",
      description: "Test",
      date: "2025-01-01T10:00:00.000Z",
      end_date: null,
      location: "Paris",
      image_url: null,
      max_participants: null,
      created_at: "2025-01-01T10:00:00.000Z",
      updated_at: "2025-01-01T10:00:00.000Z",
    });
    updateEventMock.mockResolvedValue({
      id: 2,
      title: "Atelier",
      description: "Test",
      date: "2025-01-01T10:00:00.000Z",
      end_date: null,
      location: "Paris",
      image_url: null,
      max_participants: null,
      created_at: "2025-01-01T10:00:00.000Z",
      updated_at: "2025-01-01T10:00:00.000Z",
    });

    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/admin/events/2/edit"]}>
        <Routes>
          <Route path="/admin/events/:id/edit" element={<EventFormPage />} />
          <Route path="/admin" element={<div>Admin landing</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByDisplayValue("Atelier")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Mettre à jour" }));

    expect(updateEventMock).toHaveBeenCalledWith(2, expect.any(Object));
    expect(await screen.findByText("Admin landing")).toBeInTheDocument();
  });
});
