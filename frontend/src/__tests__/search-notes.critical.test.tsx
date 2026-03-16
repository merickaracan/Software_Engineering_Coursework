/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SearchNotesPage from "../pages/SearchNotesPage";

const navigateMock = vi.fn();
const searchNotesMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../components/PageHeader", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../components/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

vi.mock("../api/notes", () => ({
  searchNotes: (...args: unknown[]) => searchNotesMock(...args),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

import { message } from "antd";

const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

describe("SearchNotesPage critical flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchNotesMock.mockReset();
    searchNotesMock.mockResolvedValue({ ok: true, data: [] });
    mockFetch.mockReset();
    localStorage.clear();
  });

  it("renders notes from initial search and opens note detail", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "student@bath.ac.uk" }));
    searchNotesMock.mockResolvedValueOnce({
      ok: true,
      data: [
        {
          id: "11",
          owner_id: 1,
          owner_email: "student@bath.ac.uk",
          title: "Concurrency Cheatsheet",
          note_data: "summary content",
          module: "se",
          is_verified: 1,
          created_at: "",
          updated_at: "",
        },
      ],
    });

    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: true, data: [{ lecturer: 0 }] }),
    });

    render(
      <MemoryRouter>
        <SearchNotesPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Concurrency Cheatsheet")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Concurrency Cheatsheet"));
    expect(navigateMock).toHaveBeenCalledWith("/note/11");
  });

  it("lets lecturers verify and unverify notes", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "admin", role: "teacher" }));

    searchNotesMock.mockResolvedValueOnce({
      ok: true,
      data: [
        {
          id: "22",
          owner_id: 2,
          owner_email: "student2@bath.ac.uk",
          title: "Machine Learning Notes",
          note_data: "long content",
          module: "ml",
          is_verified: 0,
          created_at: "",
          updated_at: "",
        },
      ],
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(
      <MemoryRouter>
        <SearchNotesPage />
      </MemoryRouter>
    );

    const verifyButton = await screen.findByRole("button", { name: /verify/i });
    fireEvent.click(verifyButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/notes/verify/22", {
        method: "PUT",
        credentials: "include",
      });
      expect(message.success).toHaveBeenCalled();
    });
  });

  it("shows empty message when search returns no notes", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "student@bath.ac.uk" }));
    searchNotesMock.mockResolvedValueOnce({ ok: true, data: [] });
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ ok: true, data: [{ lecturer: 0 }] }),
    });

    render(
      <MemoryRouter>
        <SearchNotesPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no notes available/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/search by note title/i), {
      target: { value: "distributed" },
    });
    fireEvent.change(screen.getByPlaceholderText(/search by author email/i), {
      target: { value: "someone@bath.ac.uk" },
    });
  });
});
