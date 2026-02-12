import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import * as authApi from "../api/auth";
import { AuthProvider } from "../contexts/AuthContext";
import { useAuth } from "../hooks/useAuth";

vi.mock("../api/auth");

function TestConsumer() {
  const { token, isAuthenticated, loading, login, logout } = useAuth();
  return (
    <div>
      <div>loading:{String(loading)}</div>
      <div>authed:{String(isAuthenticated)}</div>
      <div>token:{token ?? "none"}</div>
      <button type="button" onClick={() => login("secret")}>
        do-login
      </button>
      <button type="button" onClick={() => logout()}>
        do-logout
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  it("restores stored token when checkAuth succeeds", async () => {
    const checkAuthMock = vi.mocked(authApi.checkAuth);
    checkAuthMock.mockResolvedValue({ authenticated: true });
    localStorage.setItem("club_poisson_token", "abc");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(await screen.findByText("loading:false")).toBeInTheDocument();
    expect(screen.getByText("authed:true")).toBeInTheDocument();
    expect(screen.getByText("token:abc")).toBeInTheDocument();
  });

  it("stores token after login", async () => {
    const loginMock = vi.mocked(authApi.login);
    loginMock.mockResolvedValue({ token: "new-token" });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "do-login" }));

    expect(loginMock).toHaveBeenCalledWith("secret");
    expect(localStorage.getItem("club_poisson_token")).toBe("new-token");
    expect(await screen.findByText("token:new-token")).toBeInTheDocument();
  });

  it("clears token on logout", async () => {
    const checkAuthMock = vi.mocked(authApi.checkAuth);
    const logoutMock = vi.mocked(authApi.logout);
    checkAuthMock.mockResolvedValue({ authenticated: true });
    logoutMock.mockResolvedValue(undefined);
    localStorage.setItem("club_poisson_token", "abc");

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    const user = userEvent.setup();
    expect(await screen.findByText("token:abc")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "do-logout" }));

    expect(logoutMock).toHaveBeenCalledWith("abc");
    expect(localStorage.getItem("club_poisson_token")).toBe(null);
    expect(await screen.findByText("authed:false")).toBeInTheDocument();
  });
});
