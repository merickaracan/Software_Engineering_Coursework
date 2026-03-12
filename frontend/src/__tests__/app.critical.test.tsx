/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";

vi.mock("../pages/Home", () => ({ default: () => <div>Home Page</div> }));
vi.mock("../pages/Register", () => ({ default: () => <div>Register Page</div> }));
vi.mock("../pages/Profile", () => ({ default: () => <div>Profile Page</div> }));
vi.mock("../pages/LeaderboardPage", () => ({ default: () => <div>Leaderboard Page</div> }));
vi.mock("../pages/MyNotesPage", () => ({ default: () => <div>My Notes Page</div> }));
vi.mock("../pages/SearchNotesPage", () => ({ default: () => <div>Search Notes Page</div> }));
vi.mock("../pages/ModulesPage", () => ({ default: () => <div>Modules Page</div> }));
vi.mock("../pages/CreateNotePage", () => ({ default: () => <div>Create Note Page</div> }));
vi.mock("../pages/NoteDetailPage", () => ({ default: () => <div>Note Detail Page</div> }));
vi.mock("../pages/EditNotePage", () => ({ default: () => <div>Edit Note Page</div> }));
vi.mock("../pages/ModuleNotesPage", () => ({ default: () => <div>Module Notes Page</div> }));
vi.mock("../pages/TeacherDashboard", () => ({ default: () => <div>Teacher Dashboard</div> }));
vi.mock("../pages/Login", () => ({
  default: ({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) => (
    <button onClick={() => setIsAuthenticated(true)}>Login Page</button>
  ),
}));
vi.mock("../pages/Dashboard", () => ({ default: () => <div>Dashboard Page</div> }));

const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

describe("App critical auth routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    window.history.pushState({}, "", "/");
  });

  it("redirects protected dashboard route to login when unauthenticated", async () => {
    window.history.pushState({}, "", "/dashboard");
    mockFetch.mockResolvedValueOnce({ ok: false });

    render(<App />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/me", {
        method: "GET",
        credentials: "include",
      });
    });

    expect(await screen.findByText("Login Page")).toBeInTheDocument();
  });

  it("renders dashboard route when authenticated", async () => {
    window.history.pushState({}, "", "/dashboard");
    mockFetch.mockResolvedValueOnce({ ok: true });

    render(<App />);

    expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
  });
});
