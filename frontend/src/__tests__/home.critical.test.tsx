/** @vitest-environment jsdom */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "../pages/Home";

const toggleThemeMock = vi.fn();

vi.mock("../components/ThemeContext", () => ({
  useTheme: () => ({ isDark: false, toggleTheme: toggleThemeMock }),
}));

describe("Home critical render", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders key hero and feature content", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/your bath university note hub/i)).toBeInTheDocument();
    expect(screen.getByText(/create & share notes/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /earn points/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  it("toggles theme from header action", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId("home-theme-toggle"));
    expect(toggleThemeMock).toHaveBeenCalledTimes(1);
  });
});
