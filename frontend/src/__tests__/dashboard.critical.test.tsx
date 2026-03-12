/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import Dashboard from "../pages/Dashboard";

vi.mock("../components/Leaderboard", () => ({
  default: () => <div>Leaderboard Stub</div>,
}));
vi.mock("../components/Modules", () => ({
  default: () => <div>Modules Stub</div>,
}));
vi.mock("../components/SideMenu", () => ({
  default: () => <div>SideMenu Stub</div>,
}));

const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

function renderDashboard() {
  render(
    <MemoryRouter>
      <ThemeProvider>
        <Dashboard />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe("Dashboard critical states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "student@bath.ac.uk" }));
  });

  it("shows empty notes state when user has no notes", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ data: [] }),
    });

    renderDashboard();

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/notes/email/student%40bath.ac.uk",
        expect.objectContaining({ credentials: "include" })
      );
    });

    expect(await screen.findByText(/you have no notes yet/i)).toBeInTheDocument();
  });

  it("renders the latest three notes in reverse order", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        data: [
          { id: 1, note_title: "Oldest", note_data: "n1", module: "MA102", email: "student@bath.ac.uk", verified: 0 },
          { id: 2, note_title: "Second", note_data: "n2", module: "CS101", email: "student@bath.ac.uk", verified: 0 },
          { id: 3, note_title: "Third", note_data: "n3", module: "CS102", email: "student@bath.ac.uk", verified: 0 },
          { id: 4, note_title: "Newest", note_data: "n4", module: "CS103", email: "student@bath.ac.uk", verified: 0 },
        ],
      }),
    });

    renderDashboard();

    expect(await screen.findByText("Newest")).toBeInTheDocument();
    expect(screen.getByText("Third")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.queryByText("Oldest")).not.toBeInTheDocument();
  });
});
