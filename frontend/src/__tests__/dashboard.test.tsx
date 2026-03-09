/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import Dashboard from "../pages/Dashboard";

const mockFetch = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).fetch = mockFetch;

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "user@bath.ac.uk", id: 1 }));
  });

  it("renders dashboard shell", async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ ok: true, data: [] }) });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Dashboard />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Notebuddy")).toBeInTheDocument();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it("shows empty recent notes state", async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ ok: true, data: [] }) });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <Dashboard />
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/you have no notes yet/i)).toBeInTheDocument();
    });
  });
});
