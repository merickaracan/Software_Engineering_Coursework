/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import NoteDetailPage from "../pages/NoteDetailPage";

const mockFetch = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).fetch = mockFetch;

describe("NoteDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "user@bath.ac.uk", id: 1 }));
  });

  it("renders note detail page when note exists", async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => ({ ok: true, data: [{ id: "1", title: "Test Note", note_data: "Body", module: "se", owner_email: "user@bath.ac.uk", is_verified: 0, created_at: "2026-01-01", updated_at: "2026-01-01" }] }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true, data: [{ is_lecturer: 0 }] }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true, data: [] }) });

    render(
      <MemoryRouter initialEntries={["/note/1"]}>
        <Routes>
          <Route
            path="/note/:id"
            element={
              <ThemeProvider>
                <NoteDetailPage />
              </ThemeProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Test Note")).toBeInTheDocument();
    });
  });

  it("shows not found state for missing note", async () => {
    mockFetch
      .mockResolvedValueOnce({ json: async () => ({ ok: false, data: [] }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true, data: [{ is_lecturer: 0 }] }) })
      .mockResolvedValueOnce({ json: async () => ({ ok: true, data: [] }) });

    render(
      <MemoryRouter initialEntries={["/note/999"]}>
        <Routes>
          <Route
            path="/note/:id"
            element={
              <ThemeProvider>
                <NoteDetailPage />
              </ThemeProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/note not found/i)).toBeInTheDocument();
    });
  });
});
