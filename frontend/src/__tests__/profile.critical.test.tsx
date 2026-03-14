/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../pages/Profile";

const navigateMock = vi.fn();
const logoutMock = vi.fn();
const getUserMock = vi.fn();

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

vi.mock("../api/auth", () => ({
  logout: () => logoutMock(),
}));

vi.mock("../api/users", () => ({
  getUser: (...args: unknown[]) => getUserMock(...args),
  updateProfilePicture: vi.fn(),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    message: {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  };
});

import { message } from "antd";

const mockFetch = vi.fn();
(globalThis as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;

describe("Profile critical flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    getUserMock.mockReset();
    localStorage.clear();
  });

  it("renders fallback details when user session is missing", async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect((await screen.findAllByText("No name set")).length).toBeGreaterThan(0);
    expect((await screen.findAllByText("No email set")).length).toBeGreaterThan(0);
    expect(screen.getByText(/you haven't shared any notes yet/i)).toBeInTheDocument();
  });

  it("loads stats and logs out", async () => {
    localStorage.setItem("user", JSON.stringify({ name: "Student User", email: "student@bath.ac.uk" }));

    getUserMock.mockResolvedValueOnce({ ok: true, data: [{ profile_picture: null }] });
    mockFetch
      .mockResolvedValueOnce({
        json: async () => ({
          data: [
            {
              id: 10,
              note_title: "Revision 1",
              module: "CM22007",
              note_data: "summary",
              rating_average: 4.5,
              number_ratings: 2,
              verified: 1,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          data: [
            {
              email: "student@bath.ac.uk",
              name: "Student User",
              avgRating: 4.5,
              totalNotes: 1,
            },
          ],
        }),
      });

    logoutMock.mockResolvedValueOnce({ ok: true });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect((await screen.findAllByText("Student User")).length).toBeGreaterThan(0);
    expect(screen.getByText("Revision 1")).toBeInTheDocument();
    expect(screen.getByText("1st")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /log out/i }));

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith("Logged out successfully");
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });
  });
});
