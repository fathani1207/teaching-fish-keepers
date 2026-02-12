import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import EventCard from "../components/EventCard";

const baseEvent = {
  id: 1,
  title: "Atelier aquascaping",
  description: "Apprendre",
  date: "2025-01-01T10:00:00.000Z",
  end_date: null,
  location: "Paris",
  image_url: "https://example.com/test.jpg",
  max_participants: 20,
  created_at: "2025-01-01T10:00:00.000Z",
  updated_at: "2025-01-01T10:00:00.000Z",
};

describe("EventCard", () => {
  it("renders event content", () => {
    render(<EventCard event={baseEvent} />);

    expect(screen.getByText("Atelier aquascaping")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText(/2025/)).toBeInTheDocument();
    expect(screen.getByAltText("Atelier aquascaping")).toBeInTheDocument();
    expect(screen.getByText("20 participants max")).toBeInTheDocument();
  });
});
