/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TeacherDashboard from "../pages/TeacherDashboard";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../components/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: vi.fn() }),
}));

vi.mock("../components/SideMenu", () => ({
  default: () => <div>SideMenu Stub</div>,
}));

vi.mock("../components/Leaderboard", () => ({
  default: ({ onTitleClick }: { onTitleClick?: () => void }) => (
    <button onClick={onTitleClick}>Leaderboard Stub</button>
  ),
}));

vi.mock("../components/Modules", () => ({
  default: ({ onTitleClick }: { onTitleClick?: () => void }) => (
    <button onClick={onTitleClick}>Modules Stub</button>
  ),
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

describe("TeacherDashboard critical flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it("renders notes and supports verify action", async () => {
    mockFetch
      .mockResolvedValueOnce({
        json: async () => ({
          data: [
            {
              id: 99,
              email: "student@bath.ac.uk",
              note_title: "Lecture Summary",
              note_data: "summary",
              module: "CM22007",
              verified: 0,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ ok: true }),
      });

    render(
      <MemoryRouter>
        <TeacherDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText("Lecture Summary")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /verify/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/notes/verify/99", {
        method: "PUT",
        credentials: "include",
      });
      expect(message.success).toHaveBeenCalled();
    });
  });

  it("shows empty state when no notes are returned", async () => {
    mockFetch.mockResolvedValueOnce({
      json: async () => ({ data: [] }),
    });

    render(
      <MemoryRouter>
        <TeacherDashboard />
      </MemoryRouter>
    );

    expect(await screen.findByText(/no notes uploaded yet/i)).toBeInTheDocument();
  });

  it("navigates from section title actions", async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ data: [] }) });

    render(
      <MemoryRouter>
        <TeacherDashboard />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole("button", { name: "Leaderboard Stub" }));
    fireEvent.click(screen.getByRole("button", { name: "Modules Stub" }));

    expect(navigateMock).toHaveBeenCalledWith("/leaderboard");
    expect(navigateMock).toHaveBeenCalledWith("/modules");
  });
});
