/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import EditNotePage from "../pages/EditNotePage";

const mockNavigate = vi.fn();
const mockGetNoteById = vi.fn();
const mockUpdateNote = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../api/notes", () => ({
  getNoteById: (...args: unknown[]) => mockGetNoteById(...args),
  updateNote: (...args: unknown[]) => mockUpdateNote(...args),
}));

describe("EditNotePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("shows not found when note does not exist", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "user@bath.ac.uk", id: 1 }));
    mockGetNoteById.mockResolvedValueOnce({ ok: false, data: [] });

    render(
      <MemoryRouter initialEntries={["/edit-note/999"]}>
        <Routes>
          <Route
            path="/edit-note/:id"
            element={
              <ThemeProvider>
                <EditNotePage />
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

  it("shows access denied for non-owner", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "other@bath.ac.uk", id: 2 }));
    mockGetNoteById.mockResolvedValueOnce({
      ok: true,
      data: [{ id: "1", title: "Owned Note", note_data: "Body", module: "se", owner_email: "user@bath.ac.uk" }],
    });

    render(
      <MemoryRouter initialEntries={["/edit-note/1"]}>
        <Routes>
          <Route
            path="/edit-note/:id"
            element={
              <ThemeProvider>
                <EditNotePage />
              </ThemeProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });
  });

  it("loads owner note and saves changes", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "user@bath.ac.uk", id: 1 }));
    mockGetNoteById.mockResolvedValueOnce({
      ok: true,
      data: [{ id: "1", title: "Initial Title", note_data: "Initial Body", module: "se", owner_email: "user@bath.ac.uk" }],
    });
    mockUpdateNote.mockResolvedValueOnce({ ok: true });

    render(
      <MemoryRouter initialEntries={["/edit-note/1"]}>
        <Routes>
          <Route
            path="/edit-note/:id"
            element={
              <ThemeProvider>
                <EditNotePage />
              </ThemeProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue("Initial Title")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mockUpdateNote).toHaveBeenCalledWith("1", "Initial Title", "Initial Body", "se", null);
    });
  });
});