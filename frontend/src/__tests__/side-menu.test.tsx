/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import SideMenu from "../components/SideMenu";

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

describe("SideMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
    mockNavigate.mockReset();
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify({ email: "user@bath.ac.uk", id: 1 }));
  });

  it("renders side menu", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <SideMenu />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText("menu-unfold")).toBeInTheDocument();
    expect(screen.getByLabelText("plus")).toBeInTheDocument();
  });

  it("navigates to create note when plus button is clicked", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <SideMenu />
        </ThemeProvider>
      </MemoryRouter>
    );

    const plusIcon = screen.getAllByLabelText("plus")[0];
    fireEvent.click(plusIcon.closest("button") as HTMLButtonElement);

    expect(mockNavigate).toHaveBeenCalledWith("/create-note");
  });

  it("logs out and navigates to login", async () => {
    mockFetch.mockResolvedValueOnce({ json: async () => ({ ok: true }) });

    render(
      <MemoryRouter>
        <ThemeProvider>
          <SideMenu />
        </ThemeProvider>
      </MemoryRouter>
    );

    const logoutIcon = screen.getAllByLabelText("logout")[0];
    fireEvent.click(logoutIcon.closest("button") as HTMLButtonElement);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
  });
});
