/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Leaderboard from "../components/Leaderboard";

vi.mock("../components/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

describe("Leaderboard critical states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it("sorts leaderboard entries and renders top ranks", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        data: [
          { name: "User B", email: "b@bath.ac.uk", avgRating: 3.2, totalNotes: 2 },
          { name: "User A", email: "a@bath.ac.uk", avgRating: 4.8, totalNotes: 5 },
          { name: "User C", email: "c@bath.ac.uk", avgRating: 4.0, totalNotes: 3 },
        ],
      }),
    });

    render(
      <MemoryRouter>
        <Leaderboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/notes/leaderboard", { credentials: "include" });
    });

    expect(await screen.findByText("User A")).toBeInTheDocument();
    expect(screen.getByText("1st")).toBeInTheDocument();
    expect(screen.getByText("2nd")).toBeInTheDocument();
    expect(screen.getByText("3rd")).toBeInTheDocument();
  });

  it("limits rows when a limit prop is provided", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        data: [
          { name: "User A", email: "a@bath.ac.uk", avgRating: 4.8, totalNotes: 5 },
          { name: "User B", email: "b@bath.ac.uk", avgRating: 4.6, totalNotes: 4 },
          { name: "User C", email: "c@bath.ac.uk", avgRating: 4.3, totalNotes: 4 },
        ],
      }),
    });

    render(
      <MemoryRouter>
        <Leaderboard limit={2} />
      </MemoryRouter>
    );

    expect(await screen.findByText("User A")).toBeInTheDocument();
    expect(screen.getByText("User B")).toBeInTheDocument();
    expect(screen.queryByText("User C")).not.toBeInTheDocument();
  });

  it("calls onTitleClick when leaderboard title is clicked", () => {
    const onTitleClick = vi.fn();
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ data: [] }),
    });

    render(
      <MemoryRouter>
        <Leaderboard onTitleClick={onTitleClick} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("heading", { name: /leaderboard/i }));
    expect(onTitleClick).toHaveBeenCalledTimes(1);
  });
});
