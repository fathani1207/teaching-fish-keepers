import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "../App";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("App", () => {
  it("shows login admin link when unauthenticated", () => {
    const useAuthMock = vi.mocked(useAuth);
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<div>Home</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const adminLink = screen.getByRole("link", { name: "Admin" });
    expect(adminLink).toHaveAttribute("href", "/login");
  });

  it("shows admin link and logout button when authenticated", () => {
    const useAuthMock = vi.mocked(useAuth);
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      token: "token",
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<div>Home</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const adminLink = screen.getByRole("link", { name: "Admin" });
    expect(adminLink).toHaveAttribute("href", "/admin");
    expect(screen.getByRole("button", { name: "Déconnexion" })).toBeInTheDocument();
  });

  it("logs out and navigates home", async () => {
    const user = userEvent.setup();
    const logout = vi.fn().mockResolvedValue(undefined);
    const useAuthMock = vi.mocked(useAuth);
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      token: "token",
      login: vi.fn(),
      logout,
    });

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<div>Home</div>} />
            <Route path="admin" element={<div>Admin Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Déconnexion" }));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Home")).toBeInTheDocument();
  });
});
