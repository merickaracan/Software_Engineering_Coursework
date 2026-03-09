/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import MyNotesPage from "../pages/MyNotesPage";

const mockFetch = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).fetch = mockFetch;

describe("MyNotesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockNavigate.mockReset();
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "user@bath.ac.uk", id: 1 }));
  });

  it("renders my notes page", async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ ok: true, data: [] }) });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <MyNotesPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "My Notes" })).toBeInTheDocument();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it("shows empty state with no notes", async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ ok: true, data: [] }) });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <MyNotesPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/you have no notes yet/i)).toBeInTheDocument();
    });
  });

  it("renders returned notes and maps module labels", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        ok: true,
        data: [
          {
            id: "42",
            owner_id: 1,
            owner_email: "user@bath.ac.uk",
            title: "SE Revision",
            note_data: "A".repeat(90),
            module: "se",
            is_verified: 0,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
        ],
      }),
    });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <MyNotesPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("SE Revision")).toBeInTheDocument();
    });

    expect(screen.getByText("Software Engineering")).toBeInTheDocument();
  });

  it("navigates to create note and note detail", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        ok: true,
        data: [
          {
            id: "7",
            owner_id: 1,
            owner_email: "user@bath.ac.uk",
            title: "Clickable Note",
            note_data: "Short body",
            module: "ai",
            is_verified: 0,
            created_at: "2026-01-01",
            updated_at: "2026-01-01",
          },
        ],
      }),
    });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <MyNotesPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /create note/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/create-note");

    await waitFor(() => {
      expect(screen.getByText("Clickable Note")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Clickable Note"));
    expect(mockNavigate).toHaveBeenCalledWith("/note/7");
  });
});
