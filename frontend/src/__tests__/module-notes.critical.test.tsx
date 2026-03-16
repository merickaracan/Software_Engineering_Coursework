/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ModuleNotesPage from "../pages/ModuleNotesPage";

const navigateMock = vi.fn();
const useParamsMock = vi.fn();
const getNotesByModuleMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => useParamsMock(),
  };
});

vi.mock("../components/PageHeader", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../components/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

vi.mock("../api/notes.js", () => ({
  getNotesByModule: (...args: unknown[]) => getNotesByModuleMock(...args),
}));

describe("ModuleNotesPage critical flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useParamsMock.mockReturnValue({ moduleCode: "CM22007" });
    getNotesByModuleMock.mockReset();
  });

  it("loads notes by module and opens note detail", async () => {
    getNotesByModuleMock.mockResolvedValueOnce({
      data: [
        {
          id: 51,
          email: "student@bath.ac.uk",
          verified: 1,
          note_data: "note body",
          rating_average: 4.2,
          number_ratings: 3,
          module: "CM22007",
          note_title: "Team Charter",
        },
      ],
    });

    render(
      <MemoryRouter>
        <ModuleNotesPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getNotesByModuleMock).toHaveBeenCalledWith("CM22007");
    });

    expect(await screen.findByText("Team Charter")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Team Charter"));
    expect(navigateMock).toHaveBeenCalledWith("/note/51");
  });

  it("shows empty state when module has no notes", async () => {
    getNotesByModuleMock.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <ModuleNotesPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no notes have been shared for this module yet/i)).toBeInTheDocument();
  });

  it("shows error state when module fetch fails", async () => {
    getNotesByModuleMock.mockRejectedValueOnce(new Error("boom"));

    render(
      <MemoryRouter>
        <ModuleNotesPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/failed to load notes/i)).toBeInTheDocument();
  });

  it("navigates back to modules", async () => {
    getNotesByModuleMock.mockResolvedValueOnce({ data: [] });

    render(
      <MemoryRouter>
        <ModuleNotesPage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole("button", { name: /back to modules/i }));
    expect(navigateMock).toHaveBeenCalledWith("/modules");
  });
});
