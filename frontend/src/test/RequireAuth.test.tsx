import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("RequireAuth", () => {
  it("renders a loading spinner while checking auth", () => {
    const useAuthMock = vi.mocked(useAuth);
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { container } = render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RequireAuth>
                <div>Secret</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("redirects unauthenticated users to login", async () => {
    const useAuthMock = vi.mocked(useAuth);
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RequireAuth>
                <div>Secret</div>
              </RequireAuth>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  it("renders children when authenticated", () => {
    const useAuthMock = vi.mocked(useAuth);
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      token: "token",
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <RequireAuth>
                <div>Secret</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Secret")).toBeInTheDocument();
  });
});
