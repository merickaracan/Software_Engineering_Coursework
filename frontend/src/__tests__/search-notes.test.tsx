/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import SearchNotesPage from "../pages/SearchNotesPage";

const mockFetch = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).fetch = mockFetch;

describe("SearchNotesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it("renders search notes page", async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ ok: true, data: [] }) });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <SearchNotesPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Search Notes" })).toBeInTheDocument();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it("renders empty state when no notes are returned", async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ ok: true, data: [] }) });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <SearchNotesPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no notes available/i)).toBeInTheDocument();
    });
  });
});
