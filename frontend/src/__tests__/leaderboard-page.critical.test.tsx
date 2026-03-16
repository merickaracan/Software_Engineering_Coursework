/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LeaderboardPage from "../pages/LeaderboardPage";

vi.mock("../components/PageHeader", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../components/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

describe("LeaderboardPage critical states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it("renders sorted leaderboard entries", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        data: [
          { name: "B User", email: "b@bath.ac.uk", avgRating: 2.3, totalNotes: 1 },
          { name: "A User", email: "a@bath.ac.uk", avgRating: 4.7, totalNotes: 4 },
          { name: "C User", email: "c@bath.ac.uk", avgRating: 3.9, totalNotes: 2 },
        ],
      }),
    });

    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/notes/leaderboard", { credentials: "include" });
    });

    expect(await screen.findByText("A User")).toBeInTheDocument();
    expect(screen.getByText("1st")).toBeInTheDocument();
    expect(screen.getByText("2nd")).toBeInTheDocument();
    expect(screen.getByText("3rd")).toBeInTheDocument();
  });

  it("shows empty state when fetch fails", async () => {
    mockFetch.mockRejectedValueOnce(new Error("boom"));

    render(
      <MemoryRouter>
        <LeaderboardPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no students yet/i)).toBeInTheDocument();
  });
});
