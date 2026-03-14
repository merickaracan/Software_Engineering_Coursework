/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyNotesPage from "../pages/MyNotesPage";

const navigateMock = vi.fn();

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

const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

describe("MyNotesPage critical states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    localStorage.clear();
  });

  it("shows empty state when user is missing", async () => {
    render(
      <MemoryRouter>
        <MyNotesPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/you have no notes yet/i)).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("loads and renders user notes", async () => {
    localStorage.setItem("user", JSON.stringify({ email: "student@bath.ac.uk" }));
    mockFetch.mockResolvedValueOnce({
      json: async () => ({
        data: [
          {
            id: 20,
            email: "student@bath.ac.uk",
            verified: 1,
            note_data: "A helpful note body",
            rating_average: 4.5,
            number_ratings: 2,
            module: "CM22007",
            note_title: "Sprint planning",
          },
        ],
      }),
    });

    render(
      <MemoryRouter>
        <MyNotesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/notes/email/student%40bath.ac.uk", {
        credentials: "include",
      });
    });

    expect(await screen.findByText("Sprint planning")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Sprint planning"));
    expect(navigateMock).toHaveBeenCalledWith("/note/20");
  });

  it("navigates to create note from action button", () => {
    render(
      <MemoryRouter>
        <MyNotesPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /create note/i }));
    expect(navigateMock).toHaveBeenCalledWith("/create-note");
  });
});
