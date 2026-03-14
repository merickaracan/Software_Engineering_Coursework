/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Modules from "../components/Modules";

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

describe("Modules critical states", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders modules and filters by search", () => {
    render(
      <MemoryRouter>
        <Modules />
      </MemoryRouter>
    );

    expect(screen.getByText("Software Engineering")).toBeInTheDocument();
    expect(screen.getByText("Programming 1")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/search modules/i), {
      target: { value: "reinforcement" },
    });

    expect(screen.getByText("Reinforcement Learning")).toBeInTheDocument();
    expect(screen.queryByText("Programming 1")).not.toBeInTheDocument();
  });

  it("shows empty state when no modules match search", () => {
    render(
      <MemoryRouter>
        <Modules />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/search modules/i), {
      target: { value: "zzzz-no-module" },
    });

    expect(screen.getByText(/no modules match your search/i)).toBeInTheDocument();
  });

  it("navigates to module details when card is clicked", () => {
    render(
      <MemoryRouter>
        <Modules />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Software Engineering"));
    expect(navigateMock).toHaveBeenCalledWith("/modules/CM22007");
  });
});
