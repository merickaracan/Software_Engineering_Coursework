/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SideMenu from "../components/SideMenu";

const navigateMock = vi.fn();
const locationState = { pathname: "/dashboard" };
const logoutMock = vi.fn();
const toggleThemeMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => locationState,
  };
});

vi.mock("../api/auth", () => ({
  logout: () => logoutMock(),
}));

vi.mock("../components/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: toggleThemeMock }),
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

describe("SideMenu critical flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ role: "student", email: "s@bath.ac.uk" }));
    locationState.pathname = "/dashboard";
  });

  it("shows student actions and navigates to create-note", () => {
    render(
      <MemoryRouter>
        <SideMenu />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole("button")[0]);
    fireEvent.click(screen.getByRole("button", { name: /create note/i }));

    expect(navigateMock).toHaveBeenCalledWith("/create-note");
  });

  it("hides student-only menu item for teacher users", () => {
    localStorage.setItem("user", JSON.stringify({ role: "teacher", email: "t@bath.ac.uk" }));

    render(
      <MemoryRouter>
        <SideMenu />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(screen.queryByText("My Notes")).not.toBeInTheDocument();
  });

  it("logs out and redirects to login", async () => {
    logoutMock.mockResolvedValueOnce({ ok: true });

    render(
      <MemoryRouter>
        <SideMenu />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole("button")[0]);
    fireEvent.click(screen.getByRole("button", { name: /log out/i }));

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalled();
      expect(message.success).toHaveBeenCalledWith("Logged out successfully");
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });
  });

  it("toggles theme from the theme action", () => {
    render(
      <MemoryRouter>
        <SideMenu />
      </MemoryRouter>
    );

    fireEvent.click(screen.getAllByRole("button")[0]);
    fireEvent.click(screen.getByRole("button", { name: /dark mode/i }));

    expect(toggleThemeMock).toHaveBeenCalledTimes(1);
  });
});
