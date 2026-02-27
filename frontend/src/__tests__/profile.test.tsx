/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "../components/ThemeContext";
import Profile from "../pages/Profile";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Profile", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows stored user details", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ name: "Test User", email: "user@bath.ac.uk" })
    );

    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route
            path="/profile"
            element={
              <ThemeProvider>
                <Profile />
              </ThemeProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Test User" })).toBeInTheDocument();
    expect(screen.getAllByText("user@bath.ac.uk").length).toBeGreaterThan(0);
  });

  it("clears user and navigates on logout", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ name: "Test User", email: "user@bath.ac.uk" })
    );

    render(
      <MemoryRouter initialEntries={["/profile"]}>
        <Routes>
          <Route
            path="/profile"
            element={
              <ThemeProvider>
                <Profile />
              </ThemeProvider>
            }
          />
          <Route path="/login" element={<div data-testid="login-route" />} />
        </Routes>
      </MemoryRouter>
    );

    const [logoutButton] = screen.getAllByRole("button", { name: /log out/i });
    fireEvent.click(logoutButton);

    expect(localStorage.getItem("user")).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});
